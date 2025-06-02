import { useState, useCallback, useEffect } from 'react';
import { ChatMessage, BttvEmoteMap, AllBttvEmotes, VodSummary, ChatData, VideoPlayState } from '../types';
import { fetchVodSummaries } from '../api/vodApi';
import { fetchChatMessages } from '../api/chatApi';
import { fetchFunnyMoments } from '../api/funnyMomentApi';
import { setQueryParam, getQueryParam } from '../utils/queryParams';
import allBttvEmotes from '../data/bttv/emotes.json';

interface VodDataState {
    vodSummaries: VodSummary[];
    selectedVod: VodSummary | null;
    messages: ChatMessage[] | null;
    currentVodBttvEmotes: BttvEmoteMap | null;
}

interface VodDataControls {
    vodSummaries: VodSummary[];
    selectedVod: VodSummary | null;
    messages: ChatMessage[] | null;
    currentVodBttvEmotes: BttvEmoteMap | null;
    selectChat: (summary: VodSummary, setFunnyMoments: (moments: number[]) => void) => Promise<void>;
    onUploadCustomVod: (json: ChatData) => void;
    resetVodData: () => void;
}

export const useVodData = (videoPlayState?: VideoPlayState): VodDataControls => {

    const [state, setState] = useState<VodDataState>({
        vodSummaries: [],
        selectedVod: null,
        messages: null,
        currentVodBttvEmotes: null
    });

    const findCorrectBttvEmotesForVod = useCallback((created_at: string): BttvEmoteMap => {
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
    }, []);

    const loadVodSummaries = useCallback(async (): Promise<void> => {
        console.debug('loadVodSummaries');
        try {
            const summaries = await fetchVodSummaries();
            setState(prev => ({ ...prev, vodSummaries: summaries }));
        } catch (error) {
            console.error('Loading vod summaries failed: ' + error);
        }
    }, []);

    const loadChatData = useCallback(async (twitchId: string, setFunnyMoments: (moments: number[]) => void): Promise<void> => {
        console.debug('loadChatData');
        try {
            const [messages, funnyMoments] = await Promise.all([
                fetchChatMessages(twitchId),
                fetchFunnyMoments(twitchId)
            ]);

            setState(prev => ({
                ...prev,
                messages,
                currentVodBttvEmotes: messages[0] ? findCorrectBttvEmotesForVod(messages[0].created_at) : null
            }));
            setFunnyMoments(funnyMoments);
        } catch (error) {
            console.log('Loading chat data failed: ' + error);
        }
    }, [findCorrectBttvEmotesForVod]);

    const selectChat = useCallback(async (summary: VodSummary, setFunnyMoments: (moments: number[]) => void): Promise<void> => {
        console.debug('selectChat: ', summary);
        setState(prev => ({ ...prev, selectedVod: summary }));
        setQueryParam('twitchId', summary.id);
        if (state.selectedVod?.id !== summary.id) {
            await loadChatData(summary.id, setFunnyMoments);
        }
    }, [state.selectedVod?.id, loadChatData]);

    const onUploadCustomVod = useCallback((json: ChatData): void => {
        console.debug('onUploadCustomVod');
        const sortedMessages = json.comments.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        setState(prev => ({
            ...prev,
            messages: sortedMessages,
            currentVodBttvEmotes: sortedMessages[0] ? findCorrectBttvEmotesForVod(sortedMessages[0].created_at) : null
        }));
    }, [findCorrectBttvEmotesForVod]);


    const resetVodData = useCallback((): void => {
        setState({
            vodSummaries: [],
            selectedVod: null,
            messages: null,
            currentVodBttvEmotes: null
        });
    }, []);

    useEffect(() => {
        if (state.vodSummaries.length === 0) {
            loadVodSummaries();
        }
    }, [state.vodSummaries.length, loadVodSummaries]);

    useEffect(() => {
        const twitchId = getQueryParam('twitchId');
        if (twitchId && state.selectedVod?.id !== twitchId) {
            const matchingVod = state.vodSummaries.find(vod => vod.id === twitchId);
            if (matchingVod) {
                setState(prev => ({ ...prev, selectedVod: matchingVod }));
                loadChatData(twitchId, () => {});
            }
        }
    }, [state.vodSummaries, state.selectedVod?.id, loadChatData]);

    useEffect(() => {
        if (videoPlayState === 'changed' || videoPlayState === 'ended') {
            setState(prev => ({
                ...prev,
                messages: null,
                currentVodBttvEmotes: null
            }));
        }
    }, [videoPlayState]);

    return {
        vodSummaries: state.vodSummaries,
        selectedVod: state.selectedVod,
        messages: state.messages,
        currentVodBttvEmotes: state.currentVodBttvEmotes,
        selectChat,
        onUploadCustomVod,
        resetVodData
    };
};
