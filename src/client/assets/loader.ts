import { ItemType } from '../../common/gameState/ItemType';
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
            img.onerror = () => {
                reject();
            }
            img.src = path;
        }));
    }

    await Promise.allSettled(promises);

    return map;
}

function getEnumLookup(e: object, directory: string) {
    const lookup: {[key: string]: string} = {};
    for(let key in e)
    {
        const value = (e as any)[key];
        if(typeof value === 'string')
        {
            lookup[key as unknown as number] = `/${directory}/${value}.svg`;
        }
    }

    return lookup;
}

async function loadAssets(): Promise<GameAssets>
{
    const tileLookup = getEnumLookup(Tile, 'tiles');
    const itemLookup = getEnumLookup(ItemType, 'items');
    const monsterLookup = getEnumLookup(MonsterType, 'monsters');

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

let instance: Promise<GameAssets> | undefined = undefined;

export async function getAssets()
{
    if(!instance)
    {
        instance = loadAssets()
    }

    return await loadAssets();
}