export enum Facing {
    North = 1,
    West = 2,
    South = 3,
    East = 4,
}

const reverse = {
    [Facing.North]: Facing.South,
    [Facing.South]: Facing.North,
    [Facing.East]: Facing.West,
    [Facing.West]: Facing.East,
}

const left = {
    [Facing.North]: Facing.West,
    [Facing.South]: Facing.East,
    [Facing.East]: Facing.North,
    [Facing.West]: Facing.South,
}

const right = {
    [Facing.North]: Facing.East,
    [Facing.South]: Facing.West,
    [Facing.East]: Facing.South,
    [Facing.West]: Facing.North,
}

export function turnAround(facing: Facing)
{
    return reverse[facing];
}

export function turnLeft(facing: Facing)
{
    return left[facing];
}

export function turnRight(facing: Facing)
{
    return right[facing];
}