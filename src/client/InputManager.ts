const enum KeyState {
    Up = 0,
    Pressed = 1,
    Released = 2,
    Held = 3,
}

export class InputManager
{
    private pressedKeys: {[key: string]: KeyState} = {};
    private oneTimeListeners: {[key: string]: () => void} = {};

    constructor()
    {
        window.addEventListener('keydown', event => this.handleKeyDown(event))
        window.addEventListener('keyup', event => this.handleKeyUp(event))
    }

    public getKeyState()
    {
        let stateMap: {[key: string]: boolean} = {};

        for(let key in this.pressedKeys)
        {
            const state = this.pressedKeys[key];
            if(state === KeyState.Pressed || state === KeyState.Held || state === KeyState.Released)
            {
                stateMap[key] = true;
            }

            if(state === KeyState.Pressed)
            {
                this.pressedKeys[key] = KeyState.Held;
            }
            else if(state === KeyState.Released)
            {
                this.pressedKeys[key] = KeyState.Up;
            }
        }

        return stateMap;
    }

    public addOneTimeListener(key: string, callback: () => void)
    {
        this.oneTimeListeners[key] = callback;
    }

    private handleKeyDown(event: KeyboardEvent)
    {
        this.pressedKeys[event.key] = KeyState.Pressed;

        const listener = this.oneTimeListeners[event.key];
        if(listener)
        {
            delete this.oneTimeListeners[event.key];
            listener();
        }
    }

    private handleKeyUp(event: KeyboardEvent)
    {
        if(this.pressedKeys[event.key] === KeyState.Pressed)
        {
            this.pressedKeys[event.key] = KeyState.Released;
        }
        else {
            this.pressedKeys[event.key] = KeyState.Up;
        }
    }
}

let instance: InputManager | undefined = undefined;

export function getInputManager() {
    if(!instance) {
        instance = new InputManager();
    }
    return instance;
}