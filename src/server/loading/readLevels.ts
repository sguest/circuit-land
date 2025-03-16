import { itemLookup } from './itemLookup';
import type { LevelData } from '../../common/gameState/LevelData';
import { monsterLookup } from './monsterLookup';
import type { Position } from '../../common/gameState/Position'
import { Tile } from '../../common/gameState/Tile';
import { tileLookup } from './tileLookup';
import { ItemType } from '../../common/gameState/ItemType';
import { MonsterType } from '../../common/gameState/MonsterType';

// https://seasip.info/ccfile.html
export const readLevels = async (path: string): Promise<LevelData[]> => {

    const file = Bun.file(path);

    const buffer: ArrayBuffer = await file.arrayBuffer();
    const view = new DataView(buffer);
    let index = 0;

    const readByte = () => {
        const value = view.getUint8(index);
        index ++;
        return value;
    }

    const readWord = () => {
        const value = view.getUint16(index, true);
        index += 2;
        return value;
    }

    const readLong = () => {
        const value = view.getUint32(index, true);
        index += 4;
        return value;
    }

    const readString = (length: number, encoded: boolean = false) => {
        let str = '';
        for(let i = 0; i < length - 1; i++) {
            let charCode = readByte();
            if(encoded) {
                charCode ^= 0x99
            }
            str += String.fromCharCode(charCode);
        }

        // 0 string terminator
        readByte();

        return str;
    }

    const showDebug = false;
    const debug = (...data: any[]) => {
        if(showDebug)
        {
            console.log(...data);
        }
    }

    const magic = readLong();
    const validMagic = 0x0002aaac;

    if(magic === validMagic) {
        debug('Magic number validation succeeded');
    }
    else {
        console.warn(`Magic number validation failed - got ${magic.toString(16)} instead of expected ${validMagic.toString(16)}. Please double check this is a valid data file.`)
    }

    const levels = readWord();
    debug(`${levels} levels found`);

    const readObject = (data: Partial<LevelData>, position: Position) => {
        let fieldType = readByte();
        let runLength = 1;

        if(fieldType === 0xff) {
            runLength = readByte();
            fieldType = readByte();
            debug(`Run-length encoding length ${runLength} type ${fieldType}`);
        }

        for(let i = 0; i < runLength; i++)
        {
            let tile: Tile;
            if(fieldType === 0x6e)
            {
                data.start = {...position};
                tile = Tile.Floor;
                debug(`Level start at (${position.x}, ${position.y})`);
            }
            else
            {
                let itemType = itemLookup[fieldType];
                let monsterSpec = monsterLookup[fieldType];

                if(itemType) {
                    data.items?.push({ position: {...position}, type: itemType });
                    debug(`Item ${ItemType[itemType]} at (${position.x}, ${position.y})`);
                    tile = Tile.Floor;
                }
                else if(monsterSpec) {
                    tile = Tile.Floor;
                    debug(`Monster ${MonsterType[monsterSpec.type]} at (${position.x}, ${position.y})`);
                    data.monsters?.push({ position: {...position}, ...monsterSpec })
                }
                else {
                    tile = tileLookup[fieldType];
                    debug(`Tile ${Tile[tile]} at (${position.x}, ${position.y})`);
                }
            }

            if(!tile)
            {
                throw new Error(`Unrecognized object code 0x${fieldType.toString(16)}`);
            }

            data.tiles ||= [];
            data.tiles[position.x] ||= [];

            if(data.tiles[position.x][position.y]) {
                if(tile !== Tile.Floor)
                {
                    if(tile !== data.tiles[position.x][position.y] && data.tiles[position.x][position.y] !== Tile.Floor)
                    {
                        console.warn(`Position (${position.x},${position.y}) has 2 different tiles specified - ${Tile[data.tiles[position.x][position.y]]} and ${Tile[tile]}. ${Tile[tile]} will be used`)
                    }
                    data.tiles[position.x][position.y] = tile;
                }
            }
            else
            {
                data.tiles[position.x][position.y] = tile;
            }

            position.x++;
            if(position.x >= data.width!) {
                position.x = 0;
                position.y++;
            }
        }
    }

    const readLayer = (data: Partial<LevelData>) => {
        const size = readWord();
        const position = { x: 0, y: 0 };
        debug(`Layer size ${size}`);

        const targetIndex = index + size;

        while(index < targetIndex) {
            readObject(data, position);
        }
    }

    const readTraps = (length: number) => {
        const targetIndex = index + length;
        while(index < targetIndex) {
            const buttonX = readByte();
            const buttonY = readByte();
            const trapX = readByte();
            const trapY = readByte();
            // unused
            readByte();
            debug(`Trap button at (${buttonX},${buttonY}) for trap at (${trapX},${trapY})`)
        }
    }

    const readCloningMachines = (length: number) => {
        const targetIndex = index + length;
        while(index < targetIndex) {
            const buttonX = readByte();
            const buttonY = readByte();
            const machineX = readByte();
            const machineY = readByte();
            debug(`Cloning machine button at (${buttonX},${buttonY}) for cloning machine at (${machineX},${machineY})`)
        }
    }

    const readMovement = (length: number) => {
        const targetIndex = index + length;
        while(index < targetIndex) {
            const monsterX = readByte();
            const monsterY = readByte();
            debug(`Monster movement init at (${monsterX},${monsterY})`)
        }
    }

    const readOptional = (data: Partial<LevelData>) => {
        const fieldType = readByte();
        const length = readByte();

        switch(fieldType) {
            // level time, unused
            case 1:
            // chips count, unused
            case 2:
                break;
            case 3:
                const title = readString(length);
                debug(`Level title "${title}"`);
                data.title = title;
                break;
            case 4:
                readTraps(length);
                break;
            case 5:
                readCloningMachines(length);
                break;
            case 6:
                const password = readString(length, true);
                data.password = password;
                debug(`Level password "${password}"`);
                break;
            case 7: 
                const hint = readString(length);
                data.hint = hint;
                debug(`Level hint "${hint}"`);
                break;
            case 8:
                const plainPassword = readString(length, true);
                data.password = plainPassword;
                debug(`Level password in plaintext "${plainPassword}"`);
                break;
            // unused
            case 9:
                break;
            case 10:
                readMovement(length);
                break;
        }
    }

    const validateLevel = (data: Partial<LevelData>): data is LevelData => {
        if(
            data.levelNumber == undefined ||
            data.time === undefined ||
            data.chips === undefined ||
            data.width === undefined ||
            data.height === undefined ||
            data.title === undefined ||
            data.password === undefined ||
            data.tiles === undefined ||
            data.items === undefined ||
            data.monsters === undefined ||
            data.start === undefined
        )
        {
            return false;
        }
        return true;
    }

    const readLevel = (): LevelData => {
        const size = readWord();
        const levelNumber = readWord();

        debug(`Reading level ${levelNumber} - ${size} bytes`);

        const time = readWord();
        debug(`${time} time limit`);

        const chips = readWord();
        debug(`${chips} chips required`);

        // unused bytes
        readWord();

        const data: Partial<LevelData> = {
            levelNumber,
            time,
            chips,
            width: 32,
            height: 32,
            tiles: [],
            items: [],
            monsters: [],
        };

        debug('Reading layer 1');
        readLayer(data);
        debug('Reading layer 2');
        readLayer(data);

        const optionalLength = readWord();
        debug(`${optionalLength} optional bytes`);

        const targetIndex = index + optionalLength;

        while(index < targetIndex) {
            readOptional(data);
        }

        if(validateLevel(data)) {
            return data;
        }

        throw new Error('Failed to load level')
    }

    const levelData: LevelData[] = [];

    for(let i = 0; i < 4; i++)
    {
        try
        {
            levelData.push(readLevel());
        }
        catch(e)
        {
            console.error(e);
            throw e;
        }
    }

    return levelData;
}