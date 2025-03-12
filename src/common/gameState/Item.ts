import type { ItemType } from './ItemType';
import type { Position } from './Position';

export interface Item {
    position: Position;
    type: ItemType;
}