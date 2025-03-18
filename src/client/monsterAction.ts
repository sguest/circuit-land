import type { Monster } from '../common/gameState/Monster';
import { MonsterType } from '../common/gameState/MonsterType';
import type { GameState } from './GameState';
import { movePosition, type Position } from '../common/gameState/Position';
import { Facing, turnAround, turnLeft, turnRight } from '../common/gameState/Facing';
import { checkCollision } from './collision';

function movePriority(level: GameState, monster: Monster, directions: Facing[])
{
    for(let direction of directions)
    {
        let newPosition = movePosition(monster.position, direction);
        if(checkCollision(level, newPosition, { type: 'monster', monsterType: monster.type }))
        {
            return direction;
        }
    }

    return undefined;
}

const actions: {[key in MonsterType]: (level: GameState, monster: Monster) => Facing | undefined} = {
    [MonsterType.Bug]: (level, monster) => {
        return movePriority(level, monster, [turnLeft(monster.facing), monster.facing, turnRight(monster.facing), turnAround(monster.facing)]);
    },
    [MonsterType.Tank]: (level, monster) => {
        return movePriority(level, monster, [monster.facing]);
    },
    [MonsterType.Ball]: (level, monster) => {
        return movePriority(level, monster, [monster.facing, turnAround(monster.facing)]);
    },
    [MonsterType.Fireball]: (level, monster) => {
        return movePriority(level, monster, [monster.facing, turnRight(monster.facing), turnLeft(monster.facing), turnAround(monster.facing)])
    },
    [MonsterType.Glider]: (level, monster) => {
        return movePriority(level, monster, [monster.facing, turnLeft(monster.facing), turnRight(monster.facing), turnAround(monster.facing)])
    }
}

export function getMonsterMove(level: GameState, monster: Monster)
{
    return actions[monster.type](level, monster);
}