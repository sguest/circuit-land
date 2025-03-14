export interface BrowserContext {
    tileContext: CanvasRenderingContext2D;
    actorContext: CanvasRenderingContext2D;
    itemContext: CanvasRenderingContext2D;
    inventoryContext: CanvasRenderingContext2D;
    levelTitle: HTMLElement;
    levelNumber: HTMLElement;
    password: HTMLElement;
    chipsCount: HTMLElement;
    timeRemaining: HTMLElement;
    hint: HTMLElement;
}

let instance: BrowserContext | undefined = undefined;

function getCanvas(id: string) {
    return document.querySelector<HTMLCanvasElement>(`#${id}`)!.getContext('2d')!;
}

export function getBrowserContext()
{
    if(!instance)
    {
        instance = {
            tileContext: getCanvas('tile-canvas'),
            itemContext: getCanvas('item-canvas'),
            actorContext: getCanvas('actor-canvas'),
            inventoryContext: getCanvas('inventory-canvas'),
            levelTitle: document.querySelector('#level-title')!,
            password: document.querySelector('#password')!,
            levelNumber: document.querySelector('#level-number')!,
            chipsCount: document.querySelector('#chips-count')!,
            timeRemaining: document.querySelector('#time-remaining')!,
            hint: document.querySelector('#hint')!,
        }
    }

    return instance;
}