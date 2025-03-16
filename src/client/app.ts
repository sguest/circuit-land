import type { LevelData } from '../common/gameState/LevelData';
import { LevelManager } from './LevelManager';

var response = await fetch('/data');
var data: LevelData[] = await response.json();

new LevelManager(data).startLevel(3);