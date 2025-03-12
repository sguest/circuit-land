import { Tile } from '../../common/gameState/Tile';

export const tileLookup: {[key: number]: Tile} = {
    0: Tile.Floor,
    1: Tile.Wall,
    3: Tile.Water,
    0x15: Tile.Exit,
    0x16: Tile.BlueDoor,
    0x17: Tile.RedDoor,
    0x18: Tile.GreenDoor,
    0x19: Tile.YellowDoor,
    0x22: Tile.ChipGate,
    0x2f: Tile.Hint,
}