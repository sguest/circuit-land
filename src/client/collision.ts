import type { Facing } from '../common/gameState/Facing';
import { ItemType } from '../common/gameState/ItemType';
import type { MonsterType } from '../common/gameState/MonsterType';
import { movePosition, positionEqual, type Position } from '../common/gameState/Position';
import { Tile } from '../common/gameState/Tile';
import type { GameState } from './GameState';

interface PlayerCollisionType {
    type: 'player',
    facing: Facing,
}

interface BlockCollisionType {
    type: 'block'
}

interface MonsterCollisionType {
    type: 'monster',
    monsterType: MonsterType,
}

type CollisionType = PlayerCollisionType | BlockCollisionType | MonsterCollisionType;

const alwaysFloor = [
    Tile.Floor,
    Tile.Hint,
];

const onlyPlayer = [
    Tile.Exit,
    Tile.Dirt,
]

const alwaysWall = [
    Tile.Wall,
]

function checkTile(level: GameState, position: Position, collisionType: CollisionType)
{
    const targetTile = level.tiles[position.x][position.y];

    if(alwaysFloor.indexOf(targetTile) >= 0)
    {
        return true;
    }

    if(alwaysWall.indexOf(targetTile) >= 0)
    {
        return false;
    }

    if(onlyPlayer.indexOf(targetTile) >= 0)
    {
        return collisionType.type === 'player';
    }

    if(targetTile === Tile.Water) {
        return collisionType.type === 'player' || collisionType.type === 'block';
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

export function checkCollision(level: GameState, position: Position, collisionType: CollisionType)
{
    if(position.x < 0 || position.y < 0 || position.x >= level.width || position.y >= level.height) {
        return false;
    }

    if(!checkTile(level, position, collisionType))
    {
        return false;
    }

    for(let item of level.dynamicItems)
    {
        if(positionEqual(item.position, position))
        {
            if(collisionType.type === 'player' && item.type === ItemType.DirtBlock)
            {
                return checkCollision(level, movePosition(position, collisionType.facing), { type: 'block' });
            }
            else
            {
                return false;
            }
        }
    }

    return true;
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