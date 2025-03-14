import type { Facing } from './Facing';
import type { Position } from './Position';

export interface Actor {
    position: Position;
    facing: Facing;
}