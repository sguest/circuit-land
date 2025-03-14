import type { Item } from '../common/gameState/Item';
import type { ItemType } from '../common/gameState/ItemType';
import type { Monster } from '../common/gameState/Monster';
import type { Tile } from '../common/gameState/Tile';
import type { Player } from './Player';

export interface GameState {
    width: number;
    height: number;
    tiles: Tile[][];
    items: Set<Item>;
    monsters: Monster[];
    player: Player;
    inventory: Map<ItemType, number>,
    chipsRemaining: number,
}