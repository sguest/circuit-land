import { Facing } from './Facing';

export interface Position {
    x: number;
    y: number;
}

const deltas = {
    [Facing.North]: { x: 0, y: -1},
    [Facing.South]: { x: 0, y: 1},
    [Facing.East]: { x: 1, y: 0},
    [Facing.West]: { x: -1, y: 0},
}

export function movePosition(position: Position, direction: Facing, distance: number = 1)
{
    const delta = deltas[direction];

    return {
        x: position.x + delta.x * distance,
        y: position.y + delta.y * distance,
    };
}

export function positionEqual(a: Position, b: Position)
{
    return a.x === b.x && a.y === b.y;
}