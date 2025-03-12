import { ItemType } from '../../common/gameState/ItemType';

export const itemLookup: {[key: number]: ItemType} = {
    0x02: ItemType.Chip,
    0x0a: ItemType.DirtBlock,
    0x64: ItemType.BlueKey,
    0x65: ItemType.RedKey,
    0x66: ItemType.GreenKey,
    0x67: ItemType.YellowKey,
}