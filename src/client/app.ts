import { Facing } from '../common/gameState/Facing';
import type { LevelData } from '../common/gameState/LevelData';
import { loadAssets } from './assets/loader';
import type { BrowserContext } from './BrowserContext';
import type { GameState } from './GameState';
import { renderLevel } from './rendering/render';

var response = await fetch('/data');
var data: LevelData[] = await response.json();

const levelData = data[0];

const getCanvas = (id: string) => {
    return document.querySelector<HTMLCanvasElement>(`#${id}`)!.getContext('2d')!;
}

const browserContext: BrowserContext = {
    tileContext: getCanvas('tile-canvas'),
    itemContext: getCanvas('item-canvas'),
    monsterContext: getCanvas('monster-canvas'),
}

const gameState: GameState = {
    width: levelData.width,
    height: levelData.height,
    tiles: levelData.tiles,
    items: levelData.items,
    monsters: levelData.monsters,
    player: {
        position: levelData.start,
        facing: Facing.South,
    },
}

loadAssets(levelData).then(assets => renderLevel(gameState, browserContext, assets));