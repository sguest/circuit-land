import type { Position } from '../common/gameState/Position';
import { Tile } from '../common/gameState/Tile';
import type { GameState } from './GameState';

interface PlayerCollisionType {
    type: 'player',
}

type CollisionType = PlayerCollisionType;

const alwaysFloor = [
    Tile.Floor,
    Tile.Hint,
];

const alwaysWall = [
    Tile.Wall,
]

export const PlayerCollision: PlayerCollisionType = { type: 'player'}

export function checkCollision(level: GameState, position: Position, collisionType: CollisionType)
{
    if(position.x < 0 || position.y < 0 || position.x >= level.width || position.y >= level.height) {
        return false;
    }

    const targetTile = level.tiles[position.x][position.y];

    if(alwaysFloor.indexOf(targetTile) >= 0)
    {
        return true;
    }

    if(alwaysWall.indexOf(targetTile) >= 0)
    {
        return false;
    }

    if(targetTile === Tile.Water) {
        return collisionType.type === 'player';
    }

    return false;
}