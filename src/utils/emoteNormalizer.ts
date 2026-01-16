import { BttvEmote, NormalizedEmote, SevenTvEmote, FfzEmote, TwitchChannelEmote, EmoteMap } from '../types';

export const normalizeBttvEmote = (raw: BttvEmote): NormalizedEmote => {
    const { id, code } = raw;
    return {
        id,
        code,
        source: 'bttv',
        urls: {
            '1x': `https://cdn.betterttv.net/emote/${id}/1x`,
            '2x': `https://cdn.betterttv.net/emote/${id}/2x`,
            '3x': `https://cdn.betterttv.net/emote/${id}/3x`
        },
        animated: false
    };
};

export const normalize7TvEmote = (raw: SevenTvEmote): NormalizedEmote => {
    const { id, name, data } = raw;
    const baseUrl = data.host.url.startsWith('//') ? `https:${data.host.url}` : data.host.url;

    const webpFiles = data.host.files.filter(f => f.format === 'WEBP');
    const pngFiles = data.host.files.filter(f => f.format === 'PNG');
    const gifFiles = data.host.files.filter(f => f.format === 'GIF');
    const files = webpFiles.length > 0 ? webpFiles : (pngFiles.length > 0 ? pngFiles : gifFiles);

    const urls: any = {};
    files.forEach(file => {
        if (file.name.startsWith('1x')) urls['1x'] = `${baseUrl}/${file.name}`;
        else if (file.name.startsWith('2x')) urls['2x'] = `${baseUrl}/${file.name}`;
        else if (file.name.startsWith('3x')) urls['3x'] = `${baseUrl}/${file.name}`;
        else if (file.name.startsWith('4x')) urls['4x'] = `${baseUrl}/${file.name}`;
    });

    return {
        id,
        code: name,
        source: 'sevenTv',
        urls: {
            '1x': urls['1x'] || `${baseUrl}/1x.webp`,
            '2x': urls['2x'] || `${baseUrl}/2x.webp`,
            '3x': urls['3x'],
            '4x': urls['4x']
        },
        animated: data.animated
    };
};

export const normalizeFfzEmote = (raw: FfzEmote): NormalizedEmote => {
    const { id, name, width, height, urls } = raw;
    return {
        id: id.toString(),
        code: name,
        source: 'ffz',
        urls: {
            '1x': urls['1'],
            '2x': urls['2'],
            '4x': urls['4']
        },
        animated: false,
        width,
        height
    };
};

export const normalizeTwitchEmote = (raw: TwitchChannelEmote): NormalizedEmote => {
    const { id, name, images, format } = raw;
    return {
        id,
        code: name,
        source: 'twitch',
        urls: {
            '1x': images.url_1x,
            '2x': images.url_2x,
            '4x': images.url_4x
        },
        animated: format.includes('animated')
    };
};

export const buildEmoteMap = (
    bttvEmotes: BttvEmote[],
    sevenTvEmotes: SevenTvEmote[],
    ffzEmotes: FfzEmote[],
    twitchEmotes: TwitchChannelEmote[]
): EmoteMap => {
    const emoteMap: EmoteMap = {};

    twitchEmotes.forEach(emote => {
        const normalized = normalizeTwitchEmote(emote);
        emoteMap[normalized.code] = normalized;
    });

    ffzEmotes.forEach(emote => {
        const normalized = normalizeFfzEmote(emote);
        emoteMap[normalized.code] = normalized;
    });

    sevenTvEmotes.forEach(emote => {
        const normalized = normalize7TvEmote(emote);
        emoteMap[normalized.code] = normalized;
    });

    bttvEmotes.forEach(emote => {
        const normalized = normalizeBttvEmote(emote);
        emoteMap[normalized.code] = normalized;
    });

    return emoteMap;
};
