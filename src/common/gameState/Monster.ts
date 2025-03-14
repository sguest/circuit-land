import type { Actor } from './Actor';
import type { MonsterType } from './MonsterType';

export interface Monster extends Actor {
    type: MonsterType;
}