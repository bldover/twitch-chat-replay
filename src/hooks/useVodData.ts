import allBttvEmotes from '../data/bttv/emotes.json';
import { useState, useCallback, useEffect } from 'react';
import { ChatMessage, BttvEmoteMap, VodSummary, ChatData, AllBttvEmotes, VodState } from '../types';
import { fetchVodSummaries } from '../api/vodApi';
import { fetchChatMessages } from '../api/chatApi';
import { fetchFunnyMoments } from '../api/funnyMomentApi';
import { setQueryParam, getQueryParam } from '../utils/queryParams';

interface VodDataState {
    vodSummaries: VodSummary[];
    selectedVod: VodSummary | null;
    messages: ChatMessage[] | null;
    currentVodBttvEmotes: BttvEmoteMap | null;
    broadcaster: string | null;
}

interface VodDataControls {
    vodState: VodState;
    selectVod: (summary: VodSummary) => void;
    onUploadCustomVod: (json: ChatData) => void;
    resetSelectedChat: () => void;
}

export const useVodData = (setFunnyMoments: (moments: number[]) => void): VodDataControls => {

    const [vodState, setState] = useState<VodDataState>({
        vodSummaries: [],
        selectedVod: null,
        messages: null,
        currentVodBttvEmotes: null,
        broadcaster: null
    });

    const loadVodSummaries = useCallback((): void => {
        console.debug('loadVodSummaries');
        fetchVodSummaries()
            .then((summaries) => setState(prev => ({ ...prev, vodSummaries: summaries })))
            .catch((err) => console.error('Loading vod summaries failed: ' + err));
    }, []);

    const findCorrectBttvEmotesForVod = (created_at: string): BttvEmoteMap => {
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

    const loadChatMessages = useCallback((twitchId: string): void => {
        console.debug('loadChatMessages');
        fetchChatMessages(twitchId)
            .then((chatData) => {
                setState(prev => ({
                    ...prev,
                    messages: chatData.comments,
                    broadcaster: chatData.video?.user_name || null,
                    currentVodBttvEmotes: chatData.comments[0] ? findCorrectBttvEmotesForVod(chatData.comments[0].created_at) : null
                }));
            })
            .catch((err) => console.log('Loading chat messages failed: ' + err));
    }, []);

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
        setState(prev => ({
            ...prev,
            messages: sortedMessages,
            broadcaster: json.video?.user_name || null,
            currentVodBttvEmotes: sortedMessages[0] ? findCorrectBttvEmotesForVod(sortedMessages[0].created_at) : null
        }));
    }, []);

    const resetSelectedChat = useCallback((): void => {
        console.debug('resetSelectedChat')
        setQueryParam('twitchId', null);
        setState(prev => ({
            ...prev,
            selectedVod: null,
            messages: null,
            broadcaster: null,
            currentVodBttvEmotes: null
        }));
    }, []);

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

    return {
        vodState,
        selectVod,
        onUploadCustomVod,
        resetSelectedChat
    };
};
