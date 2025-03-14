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
            items: new Set(),
            monsters: [],
            player: { position: { x: 0, y: 0 }, facing: Facing.South },
            inventory: new Map<ItemType, number>(),
            chipsRemaining: 0,
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
            items: new Set(levelData.items),
            monsters: levelData.monsters,
            player: {
                position: levelData.start,
                facing: Facing.South,
            },
            inventory: new Map<ItemType, number>(),
            chipsRemaining: levelData.chips,
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
                    for(let item of this.currentState.items)
                    {
                        if(positionEqual(item.position, this.currentState.player.position))
                        {
                            if(item.type === ItemType.Chip)
                            {
                                this.currentState.chipsRemaining = Math.max(this.currentState.chipsRemaining - 1, 0);
                                this.currentState.items.delete(item);
                            }
                            else if(item.type === ItemType.BlueKey || item.type === ItemType.RedKey || item.type === ItemType.GreenKey || item.type === ItemType.YellowKey)
                            {
                                this.currentState.inventory.set(item.type, (this.currentState.inventory.get(item.type) || 0) + 1);
                                this.currentState.items.delete(item);
                                console.log(this.currentState.inventory);
                            }
                        }
                    }

                    let tile = this.currentState.tiles[this.currentState.player.position.x][this.currentState.player.position.y];

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
                            this.currentState.tiles[this.currentState.player.position.x][this.currentState.player.position.y] = Tile.Floor;
                        }
                    }

                    if(tile === Tile.ChipGate && this.currentState.chipsRemaining <= 0)
                    {
                        this.currentState.tiles[this.currentState.player.position.x][this.currentState.player.position.y] = Tile.Floor;
                    }
                }
            }
        }

        renderLevel(this.currentState, this.browserContext, this.assets);
        requestAnimationFrame(time => this.handleFrame(time))
    }
}