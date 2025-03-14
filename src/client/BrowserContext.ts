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