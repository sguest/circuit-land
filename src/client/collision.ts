import { ItemType } from '../common/gameState/ItemType';
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

    if(targetTile === Tile.Exit) {
        return collisionType.type === 'player';
    }

    if(targetTile === Tile.ChipGate)
    {
        return collisionType.type === 'player' && level.chipsRemaining <= 0;
    }

    const keyType = getKeyType(targetTile)
    if(keyType)
    {
        return level.inventory.get(keyType) && collisionType.type === 'player';
    }

    return false;
}

export const getKeyType = (tile: Tile) => {
    const lookup: {[key: number]: ItemType} = {
        [Tile.BlueDoor]: ItemType.BlueKey,
        [Tile.RedDoor]: ItemType.RedKey,
        [Tile.YellowDoor]: ItemType.YellowKey,
        [Tile.GreenDoor]: ItemType.GreenKey,
    }

    return lookup[tile];
}