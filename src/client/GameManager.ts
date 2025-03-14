import { Facing } from '../common/gameState/Facing';
import { ItemType } from '../common/gameState/ItemType';
import type { LevelData } from '../common/gameState/LevelData';
import { movePosition, positionEqual, type Position } from '../common/gameState/Position';
import { Tile } from '../common/gameState/Tile';
import type { GameAssets } from './assets/GameAssets';
import { loadAssets } from './assets/loader';
import type { BrowserContext } from './BrowserContext';
import { checkCollision, getKeyType, PlayerCollision } from './collision';
import type { GameState } from './GameState';
import { InputManager } from './InputManager';
import { renderLevel } from './rendering/render';

export class GameManager
{
    private currentState: GameState;
    private assets: GameAssets;
    private inputManager: InputManager;
    private lastFrameTime = 0;
    private tickDelay = 0;

    constructor(private browserContext: BrowserContext){
        this.inputManager = new InputManager();
        this.currentState = {
            width: 0,
            height: 0,
            tiles: [],
            staticItems: new Set(),
            dynamicItems: new Set(),
            monsters: new Set(),
            player: { position: { x: 0, y: 0 }, facing: Facing.South },
            inventory: new Map<ItemType, number>(),
            chipsRemaining: 0,
            needsItemRender: false,
            needsTileRender: false,
            needsInventoryRender: false,
        }

        this.assets = {
            tileSprites: new Map(),
            itemSprites: new Map(),
            monsterSprites: new Map(),
            playerSprite: new Image(),
        }
    }

    public loadLevel(levelData: LevelData)
    {
        this.currentState = {
            width: levelData.width,
            height: levelData.height,
            tiles: levelData.tiles,
            staticItems: new Set(levelData.items.filter(i => i.type !== ItemType.DirtBlock)),
            dynamicItems: new Set(levelData.items.filter(i => i.type === ItemType.DirtBlock)),
            monsters: new Set(levelData.monsters),
            player: {
                position: levelData.start,
                facing: Facing.South,
            },
            inventory: new Map<ItemType, number>(),
            chipsRemaining: levelData.chips,
            needsItemRender: true,
            needsTileRender: true,
            needsInventoryRender: true,
        }

        loadAssets(levelData).then(assets => {
            this.assets = assets;
            this.start();
        });
    }

    private start()
    {
        this.tickDelay = 0;
        this.handleFrame(0);
    }

    private moveTo(position: Position)
    {
        if(checkCollision(this.currentState, position, PlayerCollision))
        {
            this.currentState.player.position = position;
            return true;
        }

        return false;
    }

    private checkItems()
    {
        for(let item of this.currentState.staticItems)
        {
            let collected = false;

            if(positionEqual(item.position, this.currentState.player.position))
            {
                if(item.type === ItemType.Chip)
                {
                    this.currentState.chipsRemaining = Math.max(this.currentState.chipsRemaining - 1, 0);
                    collected = true;
                }
                else if(item.type === ItemType.BlueKey || item.type === ItemType.RedKey || item.type === ItemType.GreenKey || item.type === ItemType.YellowKey)
                {
                    this.currentState.inventory.set(item.type, (this.currentState.inventory.get(item.type) || 0) + 1);
                    collected = true;
                }
            }

            if(collected)
            {
                this.currentState.staticItems.delete(item);
                this.currentState.needsItemRender = true;
                this.currentState.needsInventoryRender = true;
            }
        }
    }

    private checkCurrentTile()
    {
        let position = this.currentState.player.position;
        let tile = this.currentState.tiles[position.x][position.y];
        let newTile: Tile | undefined = undefined;

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

        if(newTile)
        {
            this.currentState.tiles[position.x][position.y] = newTile;
            this.currentState.needsTileRender = true;
        }
    }

    private handleFrame(time: number)
    {
        this.tickDelay += time - this.lastFrameTime;
        this.lastFrameTime = time;

        while(this.tickDelay >= 200)
        {
            const keyState = this.inputManager.getKeyState();
            this.tickDelay -= 200;
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
                this.currentState.player.facing = moveDirection;
                if(this.moveTo(movePosition(this.currentState.player.position, moveDirection)))
                {
                    this.checkItems();
                    this.checkCurrentTile();
                }
            }
        }

        renderLevel(this.currentState, this.browserContext, this.assets);
        requestAnimationFrame(time => this.handleFrame(time))
    }
}