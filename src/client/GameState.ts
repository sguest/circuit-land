import type { Item } from '../common/gameState/Item';
import type { ItemType } from '../common/gameState/ItemType';
import type { Monster } from '../common/gameState/Monster';
import type { Tile } from '../common/gameState/Tile';
import type { Player } from './Player';

export const enum RunningState {
    Starting = 1,
    Running = 2,
    Defeat = 3,
    Victory = 4,
}

export interface GameState {
    width: number;
    height: number;
    tiles: Tile[][];
    staticItems: Set<Item>;
    dynamicItems: Set<Item>;
    monsters: Set<Monster>;
    player: Player;
    inventory: Map<ItemType, number>,
    chipsRemaining: number,
    timeRemaining: number,
    runningState: RunningState,
    levelHint?: string;
    showHint: boolean;
    needsTileRender: boolean,
    needsItemRender: boolean,
    needsInventoryRender: boolean,
}