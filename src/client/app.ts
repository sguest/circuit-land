import type { LevelData } from '../common/gameState/LevelData';
import { GameManager } from './GameManager';
import { LevelManager } from './LevelManager';

var response = await fetch('/data');
var data: LevelData[] = await response.json();

new LevelManager(data).startLevel(0);