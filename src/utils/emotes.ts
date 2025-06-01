import allBttvEmotes from '../data/bttv/emotes.json';
import { BttvEmoteMap, AllBttvEmotes } from '../types';

export const findCorrectBttvEmotesForVod = (created_at: string): BttvEmoteMap => {
    console.debug('findCorrectBttvEmotesForVod');
    const bttvDate = Object.keys(allBttvEmotes).sort()
        .filter((bttvDate) => bttvDate < created_at)
        .reduce((date1, date2) => date1 > date2 ? date1 : date2, '0');

    const { global, northernlion: { sharedEmotes } } = (allBttvEmotes as AllBttvEmotes)[bttvDate];

    const allEmotes = global.concat(sharedEmotes);
    const resultMap: BttvEmoteMap = {};
    allEmotes.forEach((emote) => {
        resultMap[emote.code] = emote.id;
    });
    resultMap['LUL'] = resultMap['LuL'];
    return resultMap;
};