import type { Item } from './Item';
import type { Monster } from './Monster';
import type { Tile } from './Tile';
import type { Position } from './Position';

export interface LevelData {
    levelNumber: number;
    time: number;
    chips: number;
    width: number;
    height: number;
    title: string;
    hint?: string;
    password: string;
    tiles: Tile[][];
    items: Item[];
    monsters: Monster[];
    start: Position;
}