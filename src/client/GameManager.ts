import { Facing } from '../common/gameState/Facing';
import type { LevelData } from '../common/gameState/LevelData';
import { movePosition, type Position } from '../common/gameState/Position';
import type { GameAssets } from './assets/GameAssets';
import { loadAssets } from './assets/loader';
import type { BrowserContext } from './BrowserContext';
import { checkCollision, PlayerCollision } from './collision';
import type { GameState } from './GameState';
import { InputManager } from './inputManager';
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
            items: [],
            monsters: [],
            player: { position: { x: 0, y: 0 }, facing: Facing.South },
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
            items: levelData.items,
            monsters: levelData.monsters,
            player: {
                position: levelData.start,
                facing: Facing.South,
            },
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
        }
    }

    private handleFrame(time: number)
    {
        if(!this.currentState || !this.assets) {
            throw new Error('Render failed - no level loaded');
        }

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
                this.moveTo(movePosition(this.currentState.player.position, moveDirection));
            }
        }

        renderLevel(this.currentState, this.browserContext, this.assets);
        requestAnimationFrame(time => this.handleFrame(time))
    }
}