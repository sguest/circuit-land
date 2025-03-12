import type { Facing } from './Facing';
import type { MonsterType } from './MonsterType';
import type { Position } from './Position';

export interface Monster {
    position: Position;
    type: MonsterType;
    facing: Facing;
}