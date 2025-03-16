import { Facing } from '../../common/gameState/Facing';
import { MonsterType } from '../../common/gameState/MonsterType';

export interface MonsterSpec {
    type: MonsterType;
    facing: Facing;
}

export const monsterLookup: {[key: number]: MonsterSpec } = {
    0x40: { type: MonsterType.Bug, facing: Facing.North},
    0x41: { type: MonsterType.Bug, facing: Facing.West},
    0x42: { type: MonsterType.Bug, facing: Facing.South},
    0x43: { type: MonsterType.Bug, facing: Facing.East},
    0x4c: { type: MonsterType.Tank, facing: Facing.North},
    0x4d: { type: MonsterType.Tank, facing: Facing.West},
    0x4e: { type: MonsterType.Tank, facing: Facing.South},
    0x4f: { type: MonsterType.Tank, facing: Facing.East},
}