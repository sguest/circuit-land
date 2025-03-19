import type { Actor } from '../../common/gameState/Actor';
import { Facing } from '../../common/gameState/Facing';
import type { Item } from '../../common/gameState/Item';
import { ItemType } from '../../common/gameState/ItemType';

export type DynamicItem = BlockItem;

export interface BlockItem extends Actor {
    type: ItemType.DirtBlock;
}

export function dynamicFromItem(item: Item): DynamicItem | undefined
{
    switch(item.type) {
        case ItemType.DirtBlock:
            return {
                type: ItemType.DirtBlock,
                position: { ...item.position },
                facing: Facing.South,
            }
    }
}