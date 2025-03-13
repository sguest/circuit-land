import type { RenderContext } from './RenderContext';
import type { Position } from '../../common/gameState/Position';
import type { GameState } from '../GameState';
import type { BrowserContext } from '../BrowserContext';
import type { GameAssets } from '../assets/GameAssets';
import { Tile } from '../../common/gameState/Tile';
import { Facing } from '../../common/gameState/Facing';

function renderSprite(position: Position, imageData: CanvasImageSource, renderContext: RenderContext, canvas: CanvasRenderingContext2D, angle?: number)
{
    let drawX = position.x * renderContext.tileWidth;
    let drawY = position.y * renderContext.tileHeight;
    if(angle)
    {
        canvas.save();
        canvas.translate(drawX + renderContext.tileWidth / 2, drawY + renderContext.tileHeight / 2);
        canvas.rotate(angle);
        canvas.translate(-drawX - renderContext.tileWidth / 2, -drawY - renderContext.tileHeight / 2);
    }
    canvas.drawImage(imageData, drawX, drawY, renderContext.tileWidth, renderContext.tileHeight);
    if(angle)
    {
        canvas.restore();
    }
}

function clearCanvas(context: CanvasRenderingContext2D)
{
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}

export function renderLevel(level: GameState, browserContext: BrowserContext, gameAssets: GameAssets)
{
    const renderContext: RenderContext = {
        tileWidth: 30,
        tileHeight: 30,
    }

    clearCanvas(browserContext.itemContext);
    clearCanvas(browserContext.tileContext);
    clearCanvas(browserContext.monsterContext);

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

    let angle: number = 0;
    switch (level.player.facing) {
        case Facing.East:
            angle = Math.PI / 2;
            break;
        case Facing.West:
            angle = Math.PI * 1.5;
            break;
        case Facing.South:
            angle = Math.PI;
            break;
    }
    renderSprite(level.player.position, gameAssets.playerSprite, renderContext, browserContext.monsterContext, angle);
}