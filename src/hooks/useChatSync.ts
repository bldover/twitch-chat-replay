import { useState, useCallback, useEffect } from 'react';
import { ChatMessage } from '../types';
import { YouTubePlayer } from 'react-youtube';
import { findCommentIndexForOffset } from '../utils/chatSync';

interface ChatSyncState {
    messagesToRender: ChatMessage[];
    currentMessageIndex: number;
    mediaStartTime: Date;
    lastPlayEventTime: Date;
    playbackRate: number;
    chatEnabled: boolean;
    dirtyChat: boolean;
}

interface ChatSyncControls {
    messagesToRender: ChatMessage[];
    isEnabled: boolean;
    enableChat: () => void;
    disableChat: () => void;
    syncToVideo: () => void;
    setPlaybackRate: (rate: number) => void;
    resetChat: () => void;
}

export const useChatSync = (
    messages: ChatMessage[] | null,
    videoPlayer: YouTubePlayer | null,
    chatDelay: number
): ChatSyncControls => {
    const [state, setState] = useState<ChatSyncState>({
        messagesToRender: [],
        currentMessageIndex: 0,
        mediaStartTime: new Date(),
        lastPlayEventTime: new Date(),
        playbackRate: 1,
        chatEnabled: false,
        dirtyChat: false
    });

    const updateChatMessages = useCallback((): void => {
        console.debug('updateChatMessages');
        if (!state.chatEnabled || !messages) {
            return;
        }
        
        const currentTime = new Date();
        currentTime.setSeconds(currentTime.getSeconds() + (currentTime.getTime() - state.lastPlayEventTime.getTime()) * (state.playbackRate - 1) / 1000);
        
        let messagesToAdd: ChatMessage[] = [];
        let i = state.currentMessageIndex;
        while (i < messages.length && Math.ceil((currentTime.getTime() - state.mediaStartTime.getTime()) / 1000) >= (messages[i].content_offset_seconds + chatDelay)) {
            messagesToAdd = messagesToAdd.concat(messages[i]);
            i += 1;
        }

        const isDirty = state.dirtyChat;
        const newChatMessages = isDirty ? messagesToAdd : state.messagesToRender.concat(messagesToAdd);
        const start = Math.max(newChatMessages.length - 100, 0);
        const end = newChatMessages.length;

        setState(prev => ({
            ...prev,
            currentMessageIndex: i,
            messagesToRender: newChatMessages.slice(start, end),
            dirtyChat: false
        }));
    }, [state.chatEnabled, state.currentMessageIndex, state.mediaStartTime, state.lastPlayEventTime, state.playbackRate, state.dirtyChat, state.messagesToRender, messages, chatDelay]);

    const syncToVideo = useCallback((): void => {
        console.debug('syncChat');
        if (!messages || !videoPlayer) {
            return;
        }
        
        const currentTime = videoPlayer.getCurrentTime();
        const newCurrentMessageIndex = Math.max(0, findCommentIndexForOffset(messages, currentTime - chatDelay) - 100);
        const startTime = new Date();
        startTime.setSeconds(startTime.getSeconds() - currentTime);

        setState(prev => ({
            ...prev,
            currentMessageIndex: newCurrentMessageIndex,
            mediaStartTime: startTime,
            dirtyChat: true,
            lastPlayEventTime: new Date()
        }));
    }, [messages, videoPlayer, chatDelay]);

    const enableChat = useCallback((): void => {
        setState(prev => ({ ...prev, chatEnabled: true }));
    }, []);

    const disableChat = useCallback((): void => {
        setState(prev => ({ ...prev, chatEnabled: false }));
    }, []);

    const setPlaybackRate = useCallback((rate: number): void => {
        setState(prev => ({ ...prev, playbackRate: rate }));
    }, []);

    const resetChat = useCallback((): void => {
        setState({
            messagesToRender: [],
            currentMessageIndex: 0,
            mediaStartTime: new Date(),
            lastPlayEventTime: new Date(),
            playbackRate: 1,
            chatEnabled: false,
            dirtyChat: false
        });
    }, []);

    useEffect(() => {
        if (messages) {
            const timer = setTimeout(updateChatMessages, 500);
            return () => clearTimeout(timer);
        }
    }, [updateChatMessages, messages]);

    useEffect(() => {
        syncToVideo();
    }, [messages, videoPlayer, state.playbackRate, state.chatEnabled, syncToVideo]);

    return {
        messagesToRender: state.messagesToRender,
        isEnabled: state.chatEnabled,
        enableChat,
        disableChat,
        syncToVideo,
        setPlaybackRate,
        resetChat
    };
};