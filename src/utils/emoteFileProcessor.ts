import { EmoteSource, BttvEmote, SevenTvEmote, FfzEmote, TwitchChannelEmote, NormalizedEmote } from '../types';
import { EmoteFileConfig } from './settings';

export interface ValidationResult {
    valid: boolean;
    error?: string;
}

interface BttvFileFormat {
    channelEmotes: BttvEmote[];
    sharedEmotes: BttvEmote[];
}

interface SevenTvFileFormat {
    emote_set: {
        emotes: SevenTvEmote[];
    };
}

interface FfzFileFormat {
    sets: {
        [key: string]: {
            emoticons: FfzEmote[];
        };
    };
}

interface TwitchFileFormat {
    data: TwitchChannelEmote[];
}

const MAX_FILE_SIZE = 50 * 1024 * 1024;

export const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            } else {
                reject(new Error('Failed to read file as Base64'));
            }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
};

export const decodeEmoteFile = (base64: string): NormalizedEmote[] => {
    try {
        const jsonString = atob(base64);
        return JSON.parse(jsonString) as NormalizedEmote[];
    } catch (error) {
        throw new Error('Failed to decode or parse emote file');
    }
};

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

const normalize7TvEmote = (raw: SevenTvEmote): NormalizedEmote => {
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

const normalizeFfzEmote = (raw: FfzEmote): NormalizedEmote => {
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

const normalizeTwitchEmote = (raw: TwitchChannelEmote): NormalizedEmote => {
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

const extractAndNormalizeBttv = (data: BttvFileFormat): NormalizedEmote[] => {
    const normalized: NormalizedEmote[] = [];
    data.channelEmotes.forEach(emote => normalized.push(normalizeBttvEmote(emote)));
    data.sharedEmotes.forEach(emote => normalized.push(normalizeBttvEmote(emote)));
    return normalized;
};

const extractAndNormalize7Tv = (data: SevenTvFileFormat): NormalizedEmote[] => {
    return data.emote_set.emotes.map(emote => normalize7TvEmote(emote));
};

const extractAndNormalizeFfz = (data: FfzFileFormat): NormalizedEmote[] => {
    const normalized: NormalizedEmote[] = [];
    Object.values(data.sets).forEach(set => {
        set.emoticons.forEach(emote => normalized.push(normalizeFfzEmote(emote)));
    });
    return normalized;
};

const extractAndNormalizeTwitch = (data: TwitchFileFormat): NormalizedEmote[] => {
    return data.data.map(emote => normalizeTwitchEmote(emote));
};

export const validateBttvFile = (data: any): ValidationResult => {
    if (!data || typeof data !== 'object') {
        return { valid: false, error: 'Invalid JSON structure' };
    }

    if (!Array.isArray(data.channelEmotes)) {
        return { valid: false, error: 'Missing or invalid channelEmotes array' };
    }

    if (!Array.isArray(data.sharedEmotes)) {
        return { valid: false, error: 'Missing or invalid sharedEmotes array' };
    }

    for (const emote of data.channelEmotes) {
        if (!emote.id || !emote.code) {
            return { valid: false, error: 'Invalid emote structure in channelEmotes (missing id or code)' };
        }
    }

    for (const emote of data.sharedEmotes) {
        if (!emote.id || !emote.code) {
            return { valid: false, error: 'Invalid emote structure in sharedEmotes (missing id or code)' };
        }
    }

    return { valid: true };
};

export const validate7TvFile = (data: any): ValidationResult => {
    if (!data || typeof data !== 'object') {
        return { valid: false, error: 'Invalid JSON structure' };
    }

    if (!data.emote_set || typeof data.emote_set !== 'object') {
        return { valid: false, error: 'Missing or invalid emote_set object' };
    }

    if (!Array.isArray(data.emote_set.emotes)) {
        return { valid: false, error: 'Missing or invalid emotes array in emote_set' };
    }

    for (const emote of data.emote_set.emotes) {
        if (!emote.data || !emote.data.id || !emote.data.name || !emote.data.host) {
            return { valid: false, error: 'Invalid emote structure (missing id, name, or host data)' };
        }
        if (!emote.data.host.url || !Array.isArray(emote.data.host.files)) {
            return { valid: false, error: 'Invalid host structure in emote data' };
        }
    }

    return { valid: true };
};

export const validateFfzFile = (data: any): ValidationResult => {
    if (!data || typeof data !== 'object') {
        return { valid: false, error: 'Invalid JSON structure' };
    }

    if (!data.sets || typeof data.sets !== 'object') {
        return { valid: false, error: 'Missing or invalid sets object' };
    }

    const setKeys = Object.keys(data.sets);
    if (setKeys.length === 0) {
        return { valid: false, error: 'No emote sets found' };
    }

    for (const setKey of setKeys) {
        const set = data.sets[setKey];
        if (!Array.isArray(set.emoticons)) {
            return { valid: false, error: `Invalid emoticons array in set ${setKey}` };
        }

        for (const emote of set.emoticons) {
            if (!emote.id || !emote.name || !emote.urls) {
                return { valid: false, error: 'Invalid emote structure (missing id, name, or urls)' };
            }
            if (!emote.urls['1'] || !emote.urls['2'] || !emote.urls['4']) {
                return { valid: false, error: 'Invalid urls structure in emote' };
            }
        }
    }

    return { valid: true };
};

export const validateTwitchFile = (data: any): ValidationResult => {
    if (!data || typeof data !== 'object') {
        return { valid: false, error: 'Invalid JSON structure' };
    }

    if (!Array.isArray(data.data)) {
        return { valid: false, error: 'Missing or invalid data array' };
    }

    for (const emote of data.data) {
        if (!emote.id || !emote.name || !emote.images) {
            return { valid: false, error: 'Invalid emote structure (missing id, name, or images)' };
        }
        if (!emote.images.url_1x || !emote.images.url_2x || !emote.images.url_4x) {
            return { valid: false, error: 'Invalid images structure in emote' };
        }
        if (!Array.isArray(emote.format)) {
            return { valid: false, error: 'Invalid format field in emote' };
        }
    }

    return { valid: true };
};

export const processEmoteFile = async (file: File, type: EmoteSource): Promise<EmoteFileConfig> => {
    if (file.size > MAX_FILE_SIZE) {
        throw new Error(`File size exceeds maximum allowed size of 5MB (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
    }

    if (!file.name.toLowerCase().endsWith('.json')) {
        throw new Error('File must be a .json file');
    }

    const base64 = await fileToBase64(file);
    const jsonString = atob(base64);
    const data = JSON.parse(jsonString);

    let validationResult: ValidationResult;
    let normalizedEmotes: NormalizedEmote[];

    switch (type) {
        case 'bttv':
            validationResult = validateBttvFile(data);
            if (!validationResult.valid) {
                throw new Error(`Invalid BTTV file: ${validationResult.error}`);
            }
            normalizedEmotes = extractAndNormalizeBttv(data as BttvFileFormat);
            break;
        case 'sevenTv':
            validationResult = validate7TvFile(data);
            if (!validationResult.valid) {
                throw new Error(`Invalid 7TV file: ${validationResult.error}`);
            }
            normalizedEmotes = extractAndNormalize7Tv(data as SevenTvFileFormat);
            break;
        case 'ffz':
            validationResult = validateFfzFile(data);
            if (!validationResult.valid) {
                throw new Error(`Invalid FFZ file: ${validationResult.error}`);
            }
            normalizedEmotes = extractAndNormalizeFfz(data as FfzFileFormat);
            break;
        case 'twitch':
            validationResult = validateTwitchFile(data);
            if (!validationResult.valid) {
                throw new Error(`Invalid Twitch file: ${validationResult.error}`);
            }
            normalizedEmotes = extractAndNormalizeTwitch(data as TwitchFileFormat);
            break;
        default:
            throw new Error(`Unknown emote type: ${type}`);
    }

    const normalizedJson = JSON.stringify(normalizedEmotes);
    const normalizedBase64 = btoa(normalizedJson);

    return {
        id: Date.now().toString(),
        fileName: file.name,
        uploadedAt: Date.now(),
        content: normalizedBase64
    };
};
