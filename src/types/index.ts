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

export interface BttvEmoteMap {
    [code: string]: string;
}

export interface BttvEmote {
    code: string;
    id: string;
}

export interface AllBttvEmotes {
    [date: string]: {
        global: BttvEmote[];
        northernlion: {
            sharedEmotes: BttvEmote[];
        };
    };
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
    currentVodBttvEmotes: BttvEmoteMap | null;
    broadcaster: string | null;
}

export {};
