import { ChatMessage } from '../types';
import { YouTubePlayer } from 'react-youtube';

export const findCommentIndexForOffset = (messages: ChatMessage[], offset: number): number => {
    console.debug('findCommentIndexForOffset');
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

export const updateChatMessages = (
    chatEnabled: boolean,
    messages: ChatMessage[] | null,
    currentMessageIndex: number,
    messagesToRender: ChatMessage[],
    mediaStartTime: Date,
    lastPlayEventTime: Date,
    playbackRate: number,
    chatDelay: number,
    dirtyChat: boolean,
    setCurrentMessageIndex: (index: number) => void,
    setMessagesToRender: (messages: ChatMessage[]) => void,
    setDirtyChat: (dirty: boolean) => void
): void => {
    console.debug('updateChatMessages');
    if (!chatEnabled || !messages) {
        return;
    }
    const currentTime = new Date();
    currentTime.setSeconds(currentTime.getSeconds() + (currentTime.getTime() - lastPlayEventTime.getTime()) * (playbackRate - 1) / 1000);
    let messagesToAdd: ChatMessage[] = [];
    let i = currentMessageIndex;
    while (i < messages.length && Math.ceil((currentTime.getTime() - mediaStartTime.getTime()) / 1000) >= (messages[i].content_offset_seconds + chatDelay)) {
        messagesToAdd = messagesToAdd.concat(messages[i]);
        i += 1;
    }
    setCurrentMessageIndex(i);

    const isDirty = dirtyChat;
    const newChatMessages = isDirty ? messagesToAdd : messagesToRender.concat(messagesToAdd);
    const start = Math.max(newChatMessages.length - 100, 0);
    const end = newChatMessages.length;
    setMessagesToRender(newChatMessages.slice(start, end));
    if (isDirty) {
        setDirtyChat(false);
    }
};

export const syncChat = (
    messages: ChatMessage[] | null,
    videoPlayer: YouTubePlayer | null,
    chatDelay: number,
    setCurrentMessageIndex: (index: number) => void,
    setMediaStartTime: (time: Date) => void,
    setDirtyChat: (dirty: boolean) => void,
    setLastPlayEventTime: (time: Date) => void
): void => {
    console.debug('syncChat');
    if (!messages || !videoPlayer) {
        return;
    }
    const currentTime = videoPlayer.getCurrentTime();
    setCurrentMessageIndex(Math.max(0, findCommentIndexForOffset(messages, currentTime - chatDelay) - 100));
    const startTime = new Date();
    startTime.setSeconds(startTime.getSeconds() - currentTime);
    setMediaStartTime(startTime);
    setDirtyChat(true);
    setLastPlayEventTime(new Date());
};