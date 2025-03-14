import type { LevelData } from '../common/gameState/LevelData';
import type { BrowserContext } from './BrowserContext';
import { GameManager } from './GameManager';

var response = await fetch('/data');
var data: LevelData[] = await response.json();

const levelData = data[0];

const getCanvas = (id: string) => {
    return document.querySelector<HTMLCanvasElement>(`#${id}`)!.getContext('2d')!;
}

const browserContext: BrowserContext = {
    tileContext: getCanvas('tile-canvas'),
    itemContext: getCanvas('item-canvas'),
    actorContext: getCanvas('actor-canvas'),
    inventoryContext: getCanvas('inventory-canvas'),
    chipsCount: document.querySelector('#chips-count')!,
}

const manager = new GameManager(browserContext);

manager.loadLevel(levelData);