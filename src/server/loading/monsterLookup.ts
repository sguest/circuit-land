import { Facing } from '../../common/gameState/Facing';
import { MonsterType } from '../../common/gameState/MonsterType';

export interface MonsterSpec {
    type: MonsterType;
    facing: Facing;
}

export const monsterLookup: {[key: number]: MonsterSpec } = {
    0x40: { type: MonsterType.Bug, facing: Facing.North },
    0x41: { type: MonsterType.Bug, facing: Facing.West },
    0x42: { type: MonsterType.Bug, facing: Facing.South },
    0x43: { type: MonsterType.Bug, facing: Facing.East },
    0x44: { type: MonsterType.Fireball, facing: Facing.North },
    0x45: { type: MonsterType.Fireball, facing: Facing.West },
    0x46: { type: MonsterType.Fireball, facing: Facing.South },
    0x47: { type: MonsterType.Fireball, facing: Facing.East },
    0x48: { type: MonsterType.Ball, facing: Facing.North },
    0x49: { type: MonsterType.Ball, facing: Facing.West },
    0x4a: { type: MonsterType.Ball, facing: Facing.South },
    0x4b: { type: MonsterType.Ball, facing: Facing.East },
    0x4c: { type: MonsterType.Tank, facing: Facing.North },
    0x4d: { type: MonsterType.Tank, facing: Facing.West },
    0x4e: { type: MonsterType.Tank, facing: Facing.South },
    0x4f: { type: MonsterType.Tank, facing: Facing.East },
    0x50: { type: MonsterType.Glider, facing: Facing.North },
    0x51: { type: MonsterType.Glider, facing: Facing.West },
    0x52: { type: MonsterType.Glider, facing: Facing.South },
    0x53: { type: MonsterType.Glider, facing: Facing.East },
}