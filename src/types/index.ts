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

export interface BttvEmoteMap {
    [code: string]: string;
}

export interface BttvEmoteData {
    global: BttvEmote[];
    northernlion: {
        sharedEmotes: BttvEmote[];
    };
}

export interface AllBttvEmotes {
    [date: string]: BttvEmoteData;
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

export interface MatchingConfig {
    DURATION_TOLERANCE_PERCENT: number;
    WEIGHTS: {
        DURATION: number;
        TITLE: number;
    };
}

export type VideoData = {
    playlistId?: string
    initialVideoId?: string
    currentVideoId?: string
    initialVideoIndex?: number
    shuffleEnabled?: boolean
}

export type VideoPlayState = 'initializing' | 'idle' | 'playing' | 'paused' | 'ended';

export type Theme = 'ttv' | 'midnight' | 'light';

export interface BadgeVersion {
    id: string;
    image_url_1x: string;
    image_url_2x: string;
    image_url_4x: string;
    title: string;
}

export interface BadgeSet {
    set_id: string;
    versions: BadgeVersion[];
}

export interface BadgeMap {
    [key: string]: BadgeVersion;
}

export interface BadgeMaps {
    global: BadgeMap;
    globalPlusNorthernlion: BadgeMap;
}

export interface VodState {
    vodSummaries: VodSummary[];
    selectedVod: VodSummary | null;
    messages: ChatMessage[] | null;
    currentVodBttvEmotes: BttvEmoteMap | null;
    badgeMaps: BadgeMaps | null;
    broadcaster: string | null;
}

export {};
