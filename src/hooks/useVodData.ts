import nlBttvEmotes from '../data/bttv/emotes.json';
import { useState, useCallback, useEffect } from 'react';
import { ChatMessage, VodSummary, ChatData, NLBttvEmotes, VodState, EmoteMap, NormalizedEmote } from '../types';
import { fetchVodSummaries } from '../api/vodApi';
import { fetchChatMessages } from '../api/chatApi';
import { fetchFunnyMoments } from '../api/funnyMomentApi';
import { setQueryParam, getQueryParam } from '../utils/queryParams';
import { useResetSubscription } from './useResetSubscription';
import { normalizeBttvEmote } from '../utils/emoteNormalizer';
import { useSettings } from '../contexts/SettingsContext';
import { EmoteTypeSettings, CustomEmoteSettings } from '../utils/settings';
import { decodeEmoteFile } from '../utils/emoteFileProcessor';

interface VodDataState {
    vodSummaries: VodSummary[];
    selectedVod: VodSummary | null;
    messages: ChatMessage[] | null;
    currentEmotes: EmoteMap | null;
    broadcaster: string | null;
}

interface VodDataControls {
    vodState: VodState;
    selectVod: (summary: VodSummary) => void;
    onUploadCustomVod: (json: ChatData) => void;
}

export const useVodData = (setFunnyMoments: (moments: number[]) => void): VodDataControls => {
    const { settings } = useSettings();

    const [vodState, setState] = useState<VodDataState>({
        vodSummaries: [],
        selectedVod: null,
        messages: null,
        currentEmotes: null,
        broadcaster: null
    });

    const loadVodSummaries = useCallback((): void => {
        console.debug('loadVodSummaries');
        fetchVodSummaries()
            .then((summaries) => setState(prev => ({ ...prev, vodSummaries: summaries })))
            .catch((err) => console.error('Loading vod summaries failed: ' + err));
    }, []);

    const loadBttvEmotes = (bttvSettings: EmoteTypeSettings, broadcaster: string | null, vodDate: string): NormalizedEmote[] => {
        if (!bttvSettings.enabled || !bttvSettings.selectedFileId) {
            return [];
        }

        const selectedFile = bttvSettings.files.find(f => f.id === bttvSettings.selectedFileId);
        if (!selectedFile) {
            console.error('Selected BTTV file not found');
            return [];
        }

        try {
            if (selectedFile.id === 'northernlion-default') {
                if (broadcaster !== 'northernlion') {
                    return [];
                }

                const bttvDate = Object.keys(nlBttvEmotes).sort()
                    .filter((bttvDate) => bttvDate < vodDate)
                    .reduce((date1, date2) => date1 > date2 ? date1 : date2, '0');

                const { global, northernlion: { sharedEmotes } } = (nlBttvEmotes as NLBttvEmotes)[bttvDate];
                const rawEmotes = global.concat(sharedEmotes);
                return rawEmotes.map(emote => normalizeBttvEmote(emote));
            } else {
                return decodeEmoteFile(selectedFile.content);
            }
        } catch (error) {
            console.error('Error loading BTTV emotes:', error);
            return [];
        }
    };

    const load7TvEmotes = (sevenTvSettings: EmoteTypeSettings): NormalizedEmote[] => {
        if (!sevenTvSettings.enabled || !sevenTvSettings.selectedFileId) {
            return [];
        }

        const selectedFile = sevenTvSettings.files.find(f => f.id === sevenTvSettings.selectedFileId);
        if (!selectedFile) {
            console.error('Selected 7TV file not found');
            return [];
        }

        try {
            return decodeEmoteFile(selectedFile.content);
        } catch (error) {
            console.error('Error loading 7TV emotes:', error);
            return [];
        }
    };

    const loadFfzEmotes = (ffzSettings: EmoteTypeSettings): NormalizedEmote[] => {
        if (!ffzSettings.enabled || !ffzSettings.selectedFileId) {
            return [];
        }

        const selectedFile = ffzSettings.files.find(f => f.id === ffzSettings.selectedFileId);
        if (!selectedFile) {
            console.error('Selected FFZ file not found');
            return [];
        }

        try {
            return decodeEmoteFile(selectedFile.content);
        } catch (error) {
            console.error('Error loading FFZ emotes:', error);
            return [];
        }
    };

    const loadTwitchEmotes = (twitchSettings: EmoteTypeSettings): NormalizedEmote[] => {
        if (!twitchSettings.enabled || !twitchSettings.selectedFileId) {
            return [];
        }

        const selectedFile = twitchSettings.files.find(f => f.id === twitchSettings.selectedFileId);
        if (!selectedFile) {
            console.error('Selected Twitch file not found');
            return [];
        }

        try {
            return decodeEmoteFile(selectedFile.content);
        } catch (error) {
            console.error('Error loading Twitch emotes:', error);
            return [];
        }
    };

    const findCorrectEmotesForVod = useCallback((created_at: string, broadcaster: string | null, customEmotes: CustomEmoteSettings): EmoteMap => {
        console.debug('findCorrectEmotesForVod', { created_at, broadcaster });

        const bttvEmotesArray = loadBttvEmotes(customEmotes.bttv, broadcaster, created_at);
        const sevenTvEmotesArray = load7TvEmotes(customEmotes.sevenTv);
        const ffzEmotesArray = loadFfzEmotes(customEmotes.ffz);
        const twitchEmotesArray = loadTwitchEmotes(customEmotes.twitch);

        const emoteMap: EmoteMap = {};

        twitchEmotesArray.forEach(emote => {
            emoteMap[emote.code] = emote;
        });

        ffzEmotesArray.forEach(emote => {
            emoteMap[emote.code] = emote;
        });

        sevenTvEmotesArray.forEach(emote => {
            emoteMap[emote.code] = emote;
        });

        bttvEmotesArray.forEach(emote => {
            emoteMap[emote.code] = emote;
        });

        emoteMap['LUL'] = emoteMap['LuL'];

        return emoteMap;
    }, []);

    const loadChatMessages = useCallback((twitchId: string): void => {
        console.debug('loadChatMessages');
        fetchChatMessages(twitchId)
            .then((chatData) => {
                const broadcaster = chatData.video?.user_name || null;
                setState(prev => ({
                    ...prev,
                    messages: chatData.comments,
                    broadcaster,
                    currentEmotes: chatData.comments[0] ? findCorrectEmotesForVod(chatData.comments[0].created_at, broadcaster, settings.customEmotes) : null
                }));
            })
            .catch((err) => console.log('Loading chat messages failed: ' + err));
    }, [settings.customEmotes, findCorrectEmotesForVod]);

    const loadFunnyMoments = useCallback((twitchId: string): void => {
        console.debug('loadFunnyMoments');
        fetchFunnyMoments(twitchId)
            .then((funnyMoments) => setFunnyMoments(funnyMoments))
            .catch((err) => console.log('Loading funny moments failed: ' + err));
    }, [setFunnyMoments]);

    const selectVod = useCallback((summary: VodSummary): void => {
        console.debug('selectChat: ', summary);
        setState(prev => ({ ...prev, selectedVod: summary }));
        setQueryParam('twitchId', summary.id);
        if (vodState.selectedVod?.id !== summary.id) {
            loadChatMessages(summary.id);
            loadFunnyMoments(summary.id);
        }
    }, [vodState.selectedVod?.id, loadChatMessages, loadFunnyMoments]);

    const onUploadCustomVod = useCallback((json: ChatData): void => {
        console.debug('onUploadCustomVod');
        const sortedMessages = json.comments.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        const broadcaster = json.video?.user_name || null;
        setState(prev => ({
            ...prev,
            messages: sortedMessages,
            broadcaster,
            currentEmotes: sortedMessages[0] ? findCorrectEmotesForVod(sortedMessages[0].created_at, broadcaster, settings.customEmotes) : null
        }));
    }, [settings.customEmotes, findCorrectEmotesForVod]);

    const resetSelectedChat = useCallback((): void => {
        console.debug('resetSelectedChat')
        setQueryParam('twitchId', null);
        setState(prev => ({
            ...prev,
            selectedVod: null,
            messages: null,
            broadcaster: null,
            currentEmotes: null
        }));
    }, []);

    useResetSubscription('useVodData', resetSelectedChat, ['video-change', 'full-reset']);

    useEffect(() => {
        loadVodSummaries()
    }, [loadVodSummaries]);

    useEffect(() => {
        const twitchId = getQueryParam('twitchId');
        if (twitchId && vodState.selectedVod?.id !== twitchId) {
            const matchingVod = vodState.vodSummaries.find(vod => vod.id === twitchId);
            if (matchingVod) {
                setState(prev => ({ ...prev, selectedVod: matchingVod }));
                loadChatMessages(twitchId);
                loadFunnyMoments(twitchId);
            }
        }
    }, [vodState.vodSummaries, vodState.selectedVod?.id, loadChatMessages, loadFunnyMoments]);

    useEffect(() => {
        if (vodState.messages && vodState.messages.length > 0 && vodState.broadcaster !== undefined) {
            const newEmotes = findCorrectEmotesForVod(
                vodState.messages[0].created_at,
                vodState.broadcaster,
                settings.customEmotes
            );
            setState(prev => ({ ...prev, currentEmotes: newEmotes }));
        }
    }, [settings.customEmotes, vodState.messages, vodState.broadcaster, findCorrectEmotesForVod]);

    return {
        vodState,
        selectVod,
        onUploadCustomVod
    };
};
