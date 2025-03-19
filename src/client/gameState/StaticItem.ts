import type { Item } from '../../common/gameState/Item';
import { ItemType } from '../../common/gameState/ItemType';

export type StaticItem = BasicItem;

export interface BasicItem {
    type: ItemType;
}

export function staticFromItem(item: Item): StaticItem | undefined
{
    switch(item.type)
    {
        default:
            return {
                type: item.type,
            };
    }
}