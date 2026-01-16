export interface Fragment {
    text: string;
    emoticon?: {
        emoticon_id: string;
    };
}

export interface UserBadge {
    _id: string;
    version: string;
}

export interface ChatMessage {
    _id: string;
    content_offset_seconds: number;
    created_at: string;
    commenter: {
        display_name: string;
    };
    message: {
        body: string;
        user_color?: string;
        fragments?: Fragment[];
        user_badges?: UserBadge[];
    };
}

export interface BttvEmote {
    code: string;
    id: string;
}

export interface NLBttvEmotes {
    [date: string]: {
        global: BttvEmote[];
        northernlion: {
            sharedEmotes: BttvEmote[];
        };
    };
}

export type EmoteSource = 'bttv' | 'sevenTv' | 'ffz' | 'twitch';

export interface NormalizedEmote {
    id: string;
    code: string;
    source: EmoteSource;
    urls: {
        '1x': string;
        '2x': string;
        '3x'?: string;
        '4x'?: string;
    };
    animated: boolean;
    width?: number;
    height?: number;
}

export interface EmoteMap {
    [code: string]: NormalizedEmote;
}

export interface SevenTvEmote {
    id: string;
    name: string;
    data: {
        animated: boolean;
        host: {
            url: string;
            files: Array<{
                name: string;
                format: string;
                width: number;
                height: number;
                frame_count: number;
            }>;
        };
    };
}

export interface FfzEmote {
    id: number;
    name: string;
    width: number;
    height: number;
    urls: {
        '1': string;
        '2': string;
        '4': string;
    };
}

export interface TwitchChannelEmote {
    id: string;
    name: string;
    images: {
        url_1x: string;
        url_2x: string;
        url_4x: string;
    };
    format: string[];
}

export type VideoData = {
    playlistId?: string
    initialVideoId?: string
    currentVideoId?: string
    initialVideoIndex?: number
    shuffleEnabled?: boolean
}

export interface VideoMetadata {
    title: string;
    duration: number;
}

export interface VodSummary {
    id: string;
    title: string;
    created_at: string;
    duration: string;
    matchScore?: number;
}

export interface ChatData {
    video?: { user_name?: string };
    comments: ChatMessage[];
}

export interface FunnyMoment {
    timestamp: number;
}

export interface VodState {
    vodSummaries: VodSummary[];
    selectedVod: VodSummary | null;
    messages: ChatMessage[] | null;
    currentEmotes: EmoteMap | null;
    broadcaster: string | null;
}

export {};
