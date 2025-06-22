import { useState, useCallback, useEffect } from 'react';
import { ChatMessage } from '../types';
import { VideoPlayerState } from './useVideoPlayer';
import { useResetSubscription } from './useResetSubscription';
import { useSettings } from '../contexts/SettingsContext';

interface ChatSyncState {
    messagesToRender: ChatMessage[];
    currentMessageIndex: number;
    mediaStartTime: Date;
    lastPlayEventTime: Date;
    playbackRate: number;
    chatEnabled: boolean;
    dirtyChat: boolean;
    chatDelay: number;
}

interface ChatSyncControls {
    messagesToRender: ChatMessage[];
    chatEnabled: boolean;
    syncToVideo: () => void;
}

export const useChatSync = (
    messages: ChatMessage[] | null,
    playerState: VideoPlayerState
): ChatSyncControls => {
    const { settings } = useSettings();

    const [state, setState] = useState<ChatSyncState>({
        messagesToRender: [],
        currentMessageIndex: 0,
        mediaStartTime: new Date(),
        lastPlayEventTime: new Date(),
        playbackRate: playerState.playbackRate,
        chatEnabled: playerState.playState === 'playing',
        dirtyChat: false,
        chatDelay: settings.chatDelay
    });

    const findCommentIndexForOffset = (messages: ChatMessage[], offset: number): number => {
        if (!messages) return 0;
        let left = 0;
        let right = messages.length;
        let middle = 0;
        while (left !== right) {
            middle = left + Math.floor((right - left) / 2);
            const commentTime = messages[middle].content_offset_seconds;
            if ((commentTime - offset) > 0) {
                right = middle;
            } else if ((commentTime - offset) < 0) {
                left = middle + 1;
            } else {
                return middle;
            }
        }
        return left;
    };

    const updateChatMessages = useCallback((): void => {
        console.debug('updateChatMessages');
        if (!state.chatEnabled || !messages) {
            return;
        }

        const currentTime = new Date();
        currentTime.setSeconds(currentTime.getSeconds() + (currentTime.getTime() - state.lastPlayEventTime.getTime()) * (state.playbackRate - 1) / 1000);

        let messagesToAdd: ChatMessage[] = [];
        let i = state.currentMessageIndex;
        while (i < messages.length && Math.ceil((currentTime.getTime() - state.mediaStartTime.getTime()) / 1000) >= (messages[i].content_offset_seconds + state.chatDelay)) {
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
    }, [state.chatEnabled, state.currentMessageIndex, state.mediaStartTime, state.lastPlayEventTime, state.playbackRate, state.dirtyChat, state.messagesToRender, messages, state.chatDelay]);

    const syncToVideo = useCallback((): void => {
        console.debug('syncToVideo');
        if (!messages || !playerState.videoPlayer) {
            return;
        }

        const currentTime = playerState.videoPlayer.getCurrentTime();
        const newCurrentMessageIndex = Math.max(0, findCommentIndexForOffset(messages, currentTime - state.chatDelay) - 100);
        const startTime = new Date();
        startTime.setSeconds(startTime.getSeconds() - currentTime);

        setState(prev => ({
            ...prev,
            currentMessageIndex: newCurrentMessageIndex,
            mediaStartTime: startTime,
            dirtyChat: true,
            lastPlayEventTime: new Date()
        }));
    }, [messages, playerState.videoPlayer, state.chatDelay]);

    const resetChat = useCallback((): void => {
        setState({
            messagesToRender: [],
            currentMessageIndex: 0,
            mediaStartTime: new Date(),
            lastPlayEventTime: new Date(),
            playbackRate: 1,
            chatEnabled: false,
            dirtyChat: false,
            chatDelay: settings.chatDelay
        });
    }, [settings.chatDelay]);

    useResetSubscription('useChatSync', resetChat, ['full-reset']);


    useEffect(() => {
        if (messages) {
            const timer = setTimeout(updateChatMessages, 500);
            return () => clearTimeout(timer);
        }
    }, [updateChatMessages, messages]);

    useEffect(() => {
        setState(prev => ({
            ...prev,
            chatEnabled: playerState.playState === 'playing',
            playbackRate: playerState.playbackRate,
            chatDelay: settings.chatDelay
        }));

        if (playerState.playState === 'ended') {
            setState(prev => ({
                ...prev,
                messagesToRender: [],
                currentMessageIndex: 0,
                dirtyChat: false
            }));
        }
    }, [playerState.playState, playerState.playbackRate, settings.chatDelay]);

    useEffect(() => {
        syncToVideo();
    }, [messages, playerState.videoPlayer, state.playbackRate, state.chatEnabled, state.chatDelay, syncToVideo]);

    return {
        messagesToRender: state.messagesToRender,
        chatEnabled: state.chatEnabled,
        syncToVideo
    };
};
