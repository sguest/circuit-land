import { Facing, turnAround } from '../common/gameState/Facing';
import { ItemType } from '../common/gameState/ItemType';
import type { LevelData } from '../common/gameState/LevelData';
import { MonsterType } from '../common/gameState/MonsterType';
import { movePosition, positionEqual, type Position } from '../common/gameState/Position';
import { Tile } from '../common/gameState/Tile';
import type { GameAssets } from './assets/GameAssets';
import { getAssets } from './assets/loader';
import { getBrowserContext, type BrowserContext } from './BrowserContext';
import { checkCollision, getKeyType } from './collision';
import { dynamicFromItem, type DynamicItem } from './gameState/DynamicItem';
import { RunningState, type GameState } from './gameState/GameState';
import { staticFromItem, type StaticItem } from './gameState/StaticItem';
import { getInputManager, InputManager } from './InputManager';
import { getMonsterMove } from './monsterAction';
import { renderLevel } from './rendering/render';

export class GameManager
{
    private currentState: GameState;
    private assets: GameAssets;
    private inputManager: InputManager;
    private browserContext: BrowserContext;
    private lastFrameTime = 0;
    private tickDelay = 0;
    private slipDelay = 0;

    constructor(private levelData: LevelData, private onComplete: () => void){
        this.inputManager = getInputManager();
        this.browserContext = getBrowserContext();
        this.currentState = this.loadGameState();
        this.loadLevel();

        this.assets = {
            tileSprites: new Map(),
            itemSprites: new Map(),
            monsterSprites: new Map(),
            playerSprite: new Image(),
        }
    }

    private loadGameState(): GameState
    {
        let staticItems: Set<StaticItem>[][] = [];
        for(let x = 0; x < this.levelData.width; x++)
        {
            staticItems[x] = [];
            for(let y = 0; y < this.levelData.height; y++)
            {
                staticItems[x][y] = new Set<StaticItem>();
            }
        }

        let dynamicItems = new Set<DynamicItem>();

        for(let item of this.levelData.items)
        {
            let dynamicItem = dynamicFromItem(item);
            if(dynamicItem)
            {
                dynamicItems.add(dynamicItem)
            }
            else {
                let staticItem = staticFromItem(item);
                if(staticItem)
                {
                    staticItems[item.position.x][item.position.y].add(staticItem);
                }
                else
                {
                    throw new Error(`Unrecognized item type ${ItemType[item.type]}`)
                }
            }
        }

        return {
            width: this.levelData.width,
            height: this.levelData.height,
            tiles: this.levelData.tiles.map(x => [...x]),
            staticItems,
            dynamicItems,
            monsters: new Set(this.levelData.monsters.map(m => ({...m}))),
            player: {
                position: {...this.levelData.start},
                facing: Facing.South,
            },
            inventory: new Map<ItemType, number>(),
            chipsRemaining: this.levelData.chips,
            timeRemaining: this.levelData.time * 1000,
            runningState: RunningState.Starting,
            iceSliding: false,
            levelHint: this.levelData.hint,
            showHint: false,
            needsItemRender: true,
            needsTileRender: true,
            needsInventoryRender: true,
        };
    }

    private loadLevel()
    {
        this.browserContext.levelTitle.innerText = this.levelData.title;
        this.browserContext.levelNumber.innerText = this.levelData.levelNumber.toString();
        this.browserContext.password.innerText = this.levelData.password;

        getAssets().then(assets => {
            this.assets = assets;
            this.start();
        });
    }

    private start()
    {
        this.inputManager.getKeyState();
        this.tickDelay = 0;
        this.handleFrame(0);
    }

    private restart()
    {
        this.currentState = this.loadGameState();
        this.loadLevel();
    }

    private moveTo(position: Position)
    {
        if(checkCollision(this.currentState, position, { type: 'player', facing: this.currentState.player.facing }))
        {
            this.currentState.player.position = position;
            return true;
        }

        return false;
    }

    private checkItems()
    {
        const inventoryItems = [
            ItemType.BlueKey,
            ItemType.RedKey,
            ItemType.GreenKey,
            ItemType.YellowKey,
            ItemType.Flippers,
            ItemType.FireBoots,
            ItemType.IceSkates,
            ItemType.SuctionBoots,
        ];

        let tileItems = this.currentState.staticItems[this.currentState.player.position.x][this.currentState.player.position.y]
        for(let item of tileItems)
        {
            let collected = false;
            if(item.type === ItemType.Chip)
            {
                this.currentState.chipsRemaining = Math.max(this.currentState.chipsRemaining - 1, 0);
                collected = true;
            }
            else if(inventoryItems.indexOf(item.type) >= 0)
            {
                this.currentState.inventory.set(item.type, (this.currentState.inventory.get(item.type) || 0) + 1);
                collected = true;
            }

            if(collected)
            {
                tileItems.delete(item);
                this.currentState.needsItemRender = true;
                this.currentState.needsInventoryRender = true;
            }
        }

        for(let item of this.currentState.dynamicItems)
        {
            if(positionEqual(item.position, this.currentState.player.position))
            {
                if(item.type === ItemType.DirtBlock)
                {
                    item.position = movePosition(item.position, this.currentState.player.facing);
                    if(this.currentState.tiles[item.position.x][item.position.y] === Tile.Water) {
                        this.currentState.dynamicItems.delete(item);
                        this.currentState.tiles[item.position.x][item.position.y] = Tile.Dirt;
                        this.currentState.needsTileRender = true;
                    }
                }
            }
        }
    }

    private checkCurrentTile()
    {
        let position = this.currentState.player.position;
        let tile = this.currentState.tiles[position.x][position.y];
        let newTile: Tile | undefined = undefined;

        this.currentState.showHint = (tile === Tile.Hint);

        const keyType = getKeyType(tile);
        if(keyType) 
        {
            const keyCount = this.currentState.inventory.get(keyType);
            if(!!keyCount)
            {
                if(keyType !== ItemType.GreenKey)
                {
                    this.currentState.inventory.set(keyType, keyCount - 1);
                }
                newTile = Tile.Floor;
            }
        }

        if(tile === Tile.ChipGate && this.currentState.chipsRemaining <= 0)
        {
            newTile = Tile.Floor;
        }

        if(tile === Tile.Dirt)
        {
            newTile = Tile.Floor;
        }

        if(tile === Tile.Water && !this.currentState.inventory.get(ItemType.Flippers))
        {
            this.defeat();
        }

        if(tile === Tile.Fire && !this.currentState.inventory.get(ItemType.FireBoots))
        {
            this.defeat();
        }

        if(!this.currentState.inventory.get(ItemType.IceSkates) && (tile === Tile.Ice || tile === Tile.IceNorthEast || tile === Tile.IceNorthWest || tile === Tile.IceSouthEast || tile === Tile.IceSouthWest))
        {
            this.currentState.iceSliding = true;
        }

        if(tile === Tile.SwitchBlockButton)
        {
            for(let x = 0; x < this.currentState.width; x++)
            {
                for(let y = 0; y < this.currentState.height; y++)
                {
                    if(this.currentState.tiles[x][y] === Tile.SwitchBlockClosed)
                    {
                        this.currentState.tiles[x][y] = Tile.SwitchBlockOpen;
                    }
                    else if(this.currentState.tiles[x][y] === Tile.SwitchBlockOpen)
                    {
                        this.currentState.tiles[x][y] = Tile.SwitchBlockClosed;
                    }
                }
            }

            this.currentState.needsTileRender = true;
        }

        if(tile === Tile.TankButton)
        {
            for(let monster of this.currentState.monsters)
            {
                if(monster.type === MonsterType.Tank)
                {
                    monster.facing = turnAround(monster.facing);
                }
            }
        }

        if(tile === Tile.Exit) {
            this.currentState.runningState = RunningState.Victory;
            this.inputManager.addOneTimeListener('Enter', () => this.onComplete());
        }

        if(newTile)
        {
            this.currentState.tiles[position.x][position.y] = newTile;
            this.currentState.needsTileRender = true;
        }
    }

    private defeat()
    {
        this.currentState.runningState = RunningState.Defeat;
        this.inputManager.getKeyState();
        this.inputManager.addOneTimeListener('Enter', () => {
            this.restart();
        });
    }

    private checkForceMove()
    {
        const player = this.currentState.player;
        const position = player.position;
        const tile = this.currentState.tiles[position.x][position.y];
        if(tile === Tile.ForceEast && !this.currentState.inventory.get(ItemType.SuctionBoots))
        {
            player.position.x++;
        }

        if(tile === Tile.ForceWest && !this.currentState.inventory.get(ItemType.SuctionBoots))
        {
            player.position.x--;
        }

        if(tile === Tile.ForceNorth && !this.currentState.inventory.get(ItemType.SuctionBoots))
        {
            player.position.y--;
        }

        if(tile === Tile.ForceSouth && !this.currentState.inventory.get(ItemType.SuctionBoots))
        {
            player.position.y++;
        }

        if(this.currentState.iceSliding)
        {
            let slideDirection: Facing | undefined = undefined;
            if(tile === Tile.Ice)
            {
                slideDirection = player.facing;
            }
            else if(tile === Tile.IceNorthEast)
            {
                slideDirection = player.facing === Facing.South ? Facing.East : Facing.North;
            }
            else if(tile === Tile.IceNorthWest)
            {
                slideDirection = player.facing === Facing.South ? Facing.West : Facing.North;
            }
            else if(tile === Tile.IceSouthEast)
            {
                slideDirection = player.facing === Facing.North ? Facing.East : Facing.South;
            }
            else if(tile === Tile.IceSouthWest)
            {
                slideDirection = player.facing === Facing.North ? Facing.West : Facing.South;
            }

            if(slideDirection)
            {
                const targetPosition = movePosition(player.position, slideDirection);
                if(checkCollision(this.currentState, targetPosition, { type: 'player', facing: slideDirection }))
                {
                    player.facing = slideDirection;
                    player.position = movePosition(player.position, slideDirection);
                }
                else
                {
                    player.facing = turnAround(player.facing);
                    player.position = movePosition(player.position, player.facing);
                }
            }
            else
            {
                this.currentState.iceSliding = false;
            }
        }
    }

    private handleFrame(time: number)
    {
        const slipTime = 100;
        const moveTime = 200;

        const elapsed = time - this.lastFrameTime;
        this.lastFrameTime = time;

        if(this.currentState.runningState === RunningState.Running)
        {
            this.tickDelay += elapsed;
            this.slipDelay += elapsed;
            this.currentState.timeRemaining = Math.max(this.currentState.timeRemaining - elapsed, 0);
            if(this.currentState.timeRemaining <= 0)
            {
                this.defeat();
            }
        }

        if(this.currentState.runningState === RunningState.Running)
        {
            if(this.slipDelay >= slipTime)
            {
                this.slipDelay -= slipTime;
                this.checkForceMove();
            }
        }

        if(this.currentState.runningState === RunningState.Starting || (this.currentState.runningState === RunningState.Running && this.tickDelay >= moveTime))
        {
            const keyState = this.inputManager.getKeyState();
            if(!this.currentState.iceSliding)
            {
                let moveDirection: Facing | undefined = undefined;
                if(keyState["ArrowDown"]) {
                    moveDirection = Facing.South;
                }
                else if(keyState["ArrowLeft"]) {
                    moveDirection = Facing.West;
                }
                else if(keyState["ArrowUp"]) {
                    moveDirection = Facing.North;
                }
                else if(keyState["ArrowRight"]) {
                    moveDirection = Facing.East;
                }
                if(moveDirection)
                {
                    this.currentState.runningState = RunningState.Running;
                    this.currentState.player.facing = moveDirection;
                    if(this.moveTo(movePosition(this.currentState.player.position, moveDirection)))
                    {
                        this.checkItems();
                        this.checkCurrentTile();
                    }
                }
            }
        }

        if(this.currentState.runningState === RunningState.Running && this.tickDelay >= moveTime)
        {
            for(let monster of this.currentState.monsters)
            {
                let moveDirection = getMonsterMove(this.currentState, monster);
                if(moveDirection)
                {
                    monster.position = movePosition(monster.position, moveDirection);
                    monster.facing = moveDirection;
                }
                if(monster.type === MonsterType.Fireball && this.currentState.tiles[monster.position.x][monster.position.y] === Tile.Water)
                {
                    this.currentState.monsters.delete(monster);
                }
                if(positionEqual(monster.position, this.currentState.player.position))
                {
                    this.defeat();
                }
            }
        }

        if(this.tickDelay >= moveTime)
        {
            this.tickDelay -= moveTime;
        }

        renderLevel(this.currentState, this.browserContext, this.assets);
        requestAnimationFrame(time => this.handleFrame(time))
    }
}