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

export function turnAround(facing: Facing)
{
    return reverse[facing];
}