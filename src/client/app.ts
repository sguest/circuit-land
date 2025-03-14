import type { LevelData } from '../common/gameState/LevelData';
import { GameManager } from './GameManager';

var response = await fetch('/data');
var data: LevelData[] = await response.json();

const levelData = data[0];

const manager = new GameManager(levelData);