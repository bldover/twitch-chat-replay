import { ChatData, ChatMessage } from '../types';

export const fetchChatMessages = async (twitchId: string): Promise<ChatMessage[]> => {
    const url = 'http://localhost:8083/clickityclack.co.uk/content/videos/' + twitchId + '.json';
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(`Failed to fetch chat messages: ${response.status}`);
    }

    const chatData: ChatData = await response.json();
    const sortedMessages = chatData.comments.sort((a, b) => a.content_offset_seconds - b.content_offset_seconds);
    return sortedMessages;
};
