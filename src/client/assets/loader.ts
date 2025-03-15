import { ItemType } from '../../common/gameState/ItemType';
import type { LevelData } from '../../common/gameState/LevelData';
import { MonsterType } from '../../common/gameState/MonsterType';
import { Tile } from '../../common/gameState/Tile';
import type { GameAssets } from './GameAssets';


async function loadSprites<T>(spriteLookup: {[key: number]: string}): Promise<Map<T, CanvasImageSource>>
{
    const promises: Promise<void>[] = [];
    const map = new Map<T, CanvasImageSource>();

    for(let key in spriteLookup) {
        let path = spriteLookup[key];
        promises.push(new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                map.set(+key as T, img);
                resolve();
            }
            img.src = path;
        }));
    }

    await Promise.all(promises);

    return map;
}

export async function loadAssets(level: LevelData): Promise<GameAssets>
{
    var tiles = new Set<Tile>();

    for(let x = 0; x < level.width; x++)
    {
        for(let y = 0; y < level.height; y++)
        {
            tiles.add(level.tiles[x][y]);
        }
    }

    let tileLookup: {[key: string]: string} = {};

    for(let tile of tiles) {
        const tileName = Tile[tile];
        tileLookup[tile] = `/tiles/${tileName}.svg`;

        if(tile === Tile.Water)
        {
            const dirtName = Tile[Tile.Dirt];
            tileLookup[Tile.Dirt] = `/tiles/${dirtName}.svg`;
        }
    }

    var items = new Set<ItemType>();

    for(let item of level.items)
    {
        items.add(item.type);
    }

    let itemLookup: {[key: string]: string} = {};

    for(let item of items) {
        const itemName = ItemType[item];
        itemLookup[item] = `/items/${itemName}.svg`
    }

    var monsters = new Set<MonsterType>();

    for(let monster of level.monsters)
    {
        monsters.add(monster.type);
    }

    let monsterLookup: {[key: string]: string} = {};

    for(let monster of monsters) {
        const monsterName = MonsterType[monster];
        monsterLookup[monster] = `/monsters/${monsterName}.svg`
    }

    const tilePromise = loadSprites<Tile>(tileLookup);
    const itemPromise = loadSprites<ItemType>(itemLookup);
    const monsterPromise = loadSprites<MonsterType>(monsterLookup);
    const playerPromise = loadSprites({0: '/chip.svg'});

    return {
        tileSprites: await tilePromise,
        itemSprites: await itemPromise,
        monsterSprites: await monsterPromise,
        playerSprite: (await playerPromise).get(0)!,
    };
}