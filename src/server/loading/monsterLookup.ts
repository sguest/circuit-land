import { Facing } from '../../common/gameState/Facing';
import { MonsterType } from '../../common/gameState/MonsterType';

export interface MonsterSpec {
    type: MonsterType;
    facing: Facing;
}

export const monsterLookup: {[key: number]: MonsterSpec } = {
    0x40: { type: MonsterType.Bug, facing: Facing.North},
    0x41: { type: MonsterType.Bug, facing: Facing.North},
    0x42: { type: MonsterType.Bug, facing: Facing.North},
    0x43: { type: MonsterType.Bug, facing: Facing.North},
}