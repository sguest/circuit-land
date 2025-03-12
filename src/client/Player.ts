import type { Facing } from '../common/gameState/Facing';
import type { Position } from  '../common/gameState/Position';

export interface Player {
    position: Position;
    facing: Facing
}