import type { RenderContext } from './RenderContext';
import type { Position } from '../../common/gameState/Position';
import type { GameState } from '../GameState';
import type { BrowserContext } from '../BrowserContext';
import type { GameAssets } from '../assets/GameAssets';
import { Tile } from '../../common/gameState/Tile';

function renderSprite(position: Position, imageData: CanvasImageSource, renderContext: RenderContext, canvas: CanvasRenderingContext2D)
{
    canvas.drawImage(imageData, position.x * renderContext.tileWidth, position.y * renderContext.tileHeight, renderContext.tileWidth, renderContext.tileHeight);
}

export function renderLevel(level: GameState, browserContext: BrowserContext, gameAssets: GameAssets)
{
    const renderContext: RenderContext = {
        tileWidth: 30,
        tileHeight: 30,
    }

    for(let x = 0; x < level.width; x++)
    {
        for(let y = 0; y < level.height; y++) {
            const imageData = gameAssets.tileSprites.get(level.tiles[x][y]);
            if(imageData)
            {
                renderSprite({ x, y }, imageData, renderContext, browserContext.tileContext);
            }
            else
            {
                console.error(`Rendering error - unrecognized tile ${Tile[level.tiles[x][y]]}`);
            }
        }
    }

    for(let item of level.items)
    {
        const imageData = gameAssets.itemSprites.get(item.type);
        if(imageData)
        {
            renderSprite(item.position, imageData, renderContext, browserContext.itemContext);
        }
        else
        {
            console.error(`Rendering error - unrecognized item type ${item.type}`);
        }
    }

    for(let monster of level.monsters)
    {
        const imageData = gameAssets.monsterSprites.get(monster.type);
        if(imageData)
        {
            renderSprite(monster.position, imageData, renderContext, browserContext.monsterContext);
        }
        else
        {
            console.error(`Rendering error - unrecognized monster type ${monster.type}`);
        }
    }

    renderSprite(level.player.position, gameAssets.playerSprite, renderContext, browserContext.monsterContext);
}