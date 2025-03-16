import type { Monster } from '../common/gameState/Monster';
import { MonsterType } from '../common/gameState/MonsterType';
import type { GameState } from './GameState';
import { movePosition, type Position } from '../common/gameState/Position';
import { Facing } from '../common/gameState/Facing';
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
        switch(monster.facing)
        {
            case Facing.North:
                return movePriority(level, monster, [Facing.West, Facing.North, Facing.East, Facing.South]);
            case Facing.West:
                return movePriority(level, monster, [Facing.South, Facing.West, Facing.North, Facing.East]);
            case Facing.South:
                return movePriority(level, monster, [Facing.East, Facing.South, Facing.West, Facing.North]);
        }
        return movePriority(level, monster, [Facing.North, Facing.East, Facing.South, Facing.West]);
    },
    [MonsterType.Tank]: (level, monster) => {
        return movePriority(level, monster, [monster.facing]);
    }
}

export function getMonsterMove(level: GameState, monster: Monster)
{
    return actions[monster.type](level, monster);
}