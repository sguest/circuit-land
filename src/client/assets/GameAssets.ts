import type { ItemType } from '../../common/gameState/ItemType';
import type { MonsterType } from '../../common/gameState/MonsterType';
import type { Tile } from '../../common/gameState/Tile';

export interface GameAssets
{
    tileSprites: Map<Tile, CanvasImageSource>
    itemSprites: Map<ItemType, CanvasImageSource>
    monsterSprites: Map<MonsterType, CanvasImageSource>
}