import type { RenderContext } from './RenderContext';
import type { Position } from '../../common/gameState/Position';
import type { GameState } from '../gameState/GameState';
import type { BrowserContext } from '../BrowserContext';
import type { GameAssets } from '../assets/GameAssets';
import { Tile } from '../../common/gameState/Tile';
import { Facing } from '../../common/gameState/Facing';
import { ItemType } from '../../common/gameState/ItemType';
import type { Actor } from '../../common/gameState/Actor';
import { MonsterType } from '../../common/gameState/MonsterType';

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

function renderActor(actor: Actor, imageData: CanvasImageSource, renderContext: RenderContext, canvas: CanvasRenderingContext2D)
{
    let angle: number = 0;
    switch (actor.facing) {
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
    renderSprite(actor.position, imageData, renderContext, canvas, angle);
}

function clearCanvas(context: CanvasRenderingContext2D)
{
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
}

function renderTiles(level: GameState, browserContext: BrowserContext, renderContext: RenderContext, tileSprites: Map<Tile, CanvasImageSource>)
{
    clearCanvas(browserContext.tileContext);

    for(let x = 0; x < level.width; x++)
    {
        for(let y = 0; y < level.height; y++) {
            const imageData = tileSprites.get(level.tiles[x][y]);
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

    level.needsTileRender = false;
}

function renderItems(level: GameState, browserContext: BrowserContext, renderContext: RenderContext, itemSprites: Map<ItemType, CanvasImageSource>)
{
    clearCanvas(browserContext.itemContext);

    for(let x = 0; x < level.width; x++)
    {
        for(let y = 0; y < level.height; y++)
        {
            for(let item of level.staticItems[x][y])
            {
                const imageData = itemSprites.get(item.type);
                if(imageData)
                {
                    renderSprite({ x, y }, imageData, renderContext, browserContext.itemContext);
                }
                else
                {
                    console.error(`Rendering error - unrecognized item type ${ItemType[item.type]}`);
                }        
            }
        }
    }

    level.needsItemRender = false;
}

function renderInventory(level: GameState, browserContext: BrowserContext, renderContext: RenderContext, gameAssets: GameAssets)
{
    clearCanvas(browserContext.inventoryContext);

    for(let x = 0; x < 4; x++)
    {
        for(let y = 0; y < 2; y++)
        {
            renderSprite({ x, y }, gameAssets.tileSprites.get(Tile.Floor)!, renderContext, browserContext.inventoryContext);
        }
    }

    const keys = [ItemType.RedKey, ItemType.BlueKey, ItemType.YellowKey, ItemType.GreenKey];
    for(let i = 0; i < keys.length; i++)
    {
        const key = keys[i];
        const keyCount = level.inventory.get(key);
        if(keyCount)
        {
            renderSprite({ x: i, y: 0}, gameAssets.itemSprites.get(key)!, renderContext, browserContext.inventoryContext);
        }
    }

    const boots = [ItemType.Flippers, ItemType.FireBoots, ItemType.IceSkates, ItemType.SuctionBoots];
    for(let i = 0; i < boots.length; i++)
        {
            const boot = boots[i];
            const bootCount = level.inventory.get(boot);
            if(bootCount)
            {
                renderSprite({ x: i, y: 1}, gameAssets.itemSprites.get(boot)!, renderContext, browserContext.inventoryContext);
            }
        }
    
    browserContext.chipsCount.textContent = level.chipsRemaining.toString();
    
    level.needsInventoryRender = false;
}

function renderMonsters(level: GameState, browserContext: BrowserContext, renderContext: RenderContext, monsterSprites: Map<MonsterType, CanvasImageSource>)
{

    for(let monster of level.monsters)
    {
        const imageData = monsterSprites.get(monster.type);
        if(imageData)
        {
            renderActor(monster, imageData, renderContext, browserContext.actorContext);
        }
        else
        {
            console.error(`Rendering error - unrecognized monster type ${MonsterType[monster.type]}`);
        }
    }
}

function renderDynamicItems(level: GameState, browserContext: BrowserContext, renderContext: RenderContext, itemSprites: Map<ItemType, CanvasImageSource>)
{
    for(let item of level.dynamicItems)
        {
            const imageData = itemSprites.get(item.type);
            if(imageData)
            {
                renderSprite(item.position, imageData, renderContext, browserContext.actorContext);
            }
            else
            {
                console.error(`Rendering error - unrecognized item type ${item.type}`);
            }
        }}

export function renderLevel(level: GameState, browserContext: BrowserContext, gameAssets: GameAssets)
{
    const renderContext: RenderContext = {
        tileWidth: 30,
        tileHeight: 30,
    }

    clearCanvas(browserContext.actorContext);

    if(level.needsTileRender)
    {
        renderTiles(level, browserContext, renderContext, gameAssets.tileSprites);
    }

    if(level.needsItemRender)
    {
        renderItems(level, browserContext, renderContext, gameAssets.itemSprites);
    }

    if(level.needsInventoryRender)
    {
        renderInventory(level, browserContext, renderContext, gameAssets);
    }

    browserContext.timeRemaining.innerText = Math.floor(level.timeRemaining / 1000).toString();

    if(level.showHint && level.levelHint)
    {
        browserContext.hint.innerText = level.levelHint;
    }
    else {
        browserContext.hint.innerText = '';
    }

    renderMonsters(level, browserContext, renderContext, gameAssets.monsterSprites);
    renderDynamicItems(level, browserContext, renderContext, gameAssets.itemSprites);
    renderActor(level.player, gameAssets.playerSprite, renderContext, browserContext.actorContext);
}