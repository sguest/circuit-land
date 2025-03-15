import { Facing } from '../common/gameState/Facing';
import { ItemType } from '../common/gameState/ItemType';
import type { LevelData } from '../common/gameState/LevelData';
import { movePosition, positionEqual, type Position } from '../common/gameState/Position';
import { Tile } from '../common/gameState/Tile';
import type { GameAssets } from './assets/GameAssets';
import { loadAssets } from './assets/loader';
import { getBrowserContext, type BrowserContext } from './BrowserContext';
import { checkCollision, getKeyType, PlayerCollision } from './collision';
import { RunningState, type GameState } from './GameState';
import { getInputManager, InputManager } from './InputManager';
import { renderLevel } from './rendering/render';

export class GameManager
{
    private currentState: GameState;
    private assets: GameAssets;
    private inputManager: InputManager;
    private browserContext: BrowserContext;
    private lastFrameTime = 0;
    private tickDelay = 0;

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
        return {
            width: this.levelData.width,
            height: this.levelData.height,
            tiles: this.levelData.tiles.map(x => [...x]),
            staticItems: new Set(this.levelData.items.filter(i => i.type !== ItemType.DirtBlock).map(i => ({...i}))),
            dynamicItems: new Set(this.levelData.items.filter(i => i.type === ItemType.DirtBlock).map(i => ({...i}))),
            monsters: new Set(this.levelData.monsters.map(m => ({...m}))),
            player: {
                position: {...this.levelData.start},
                facing: Facing.South,
            },
            inventory: new Map<ItemType, number>(),
            chipsRemaining: this.levelData.chips,
            timeRemaining: this.levelData.time * 1000,
            runningState: RunningState.Starting,
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

        loadAssets(this.levelData).then(assets => {
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

    private handleFrame(time: number)
    {
        const elapsed = time - this.lastFrameTime;
        this.lastFrameTime = time;
        this.tickDelay += elapsed;

        if(this.currentState.runningState === RunningState.Running)
        {
            this.currentState.timeRemaining = Math.max(this.currentState.timeRemaining - elapsed, 0);
            if(this.currentState.timeRemaining <= 0)
            {
                this.defeat();
            }
        }

        if(this.currentState.runningState === RunningState.Starting || this.currentState.runningState === RunningState.Running)
        {
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

        renderLevel(this.currentState, this.browserContext, this.assets);
        requestAnimationFrame(time => this.handleFrame(time))
    }
}