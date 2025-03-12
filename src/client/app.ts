import type { LevelData } from '../common/gameState/LevelData';
import { loadAssets } from './assets/loader';
import type { BrowserContext } from './BrowserContext';
import { renderLevel } from './rendering/render';

var response = await fetch('/data');
var data: LevelData[] = await response.json();

const level = data[0];

console.log(level);

const getCanvas = (id: string) => {
    return document.querySelector<HTMLCanvasElement>(`#${id}`)!.getContext('2d')!;
}

const browserContext: BrowserContext = {
    tileContext: getCanvas('tile-canvas'),
    itemContext: getCanvas('item-canvas'),
    monsterContext: getCanvas('monster-canvas'),
}

loadAssets(level).then(assets => renderLevel(level, browserContext, assets));