import type { LevelData } from '../common/gameState/LevelData';
import { GameManager } from './GameManager';

export class LevelManager
{
    private levelNumber  = 0;

    constructor(private levelData: LevelData[])
    {
    }

    public startLevel(levelNumber: number)
    {
        this.levelNumber = levelNumber;
        new GameManager(this.levelData[levelNumber], () => this.advanceLevel());
    }

    private advanceLevel()
    {
        this.startLevel(this.levelNumber + 1);
    }
}