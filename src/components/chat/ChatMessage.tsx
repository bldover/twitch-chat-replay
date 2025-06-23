import './ChatMessage.css';
import { FC } from 'react';
import { ChatMessage as ChatMessageType, BttvEmoteMap } from '../../types';
import { getColor } from '../../utils/colors';
import UserBadges from './UserBadges';
import TwitchEmote from './TwitchEmote';
import BttvEmote from './BttvEmote';
import { BadgeMap } from '../../utils/badges';

type ChatMessageProps = {
    message: ChatMessageType;
    bttvEmotes: BttvEmoteMap | null;
    badgeMap: BadgeMap | null;
};

const ChatMessage: FC<ChatMessageProps> = ({ message, bttvEmotes, badgeMap }) => {
    const formatTimestamp = (content_offset: number): string => {
        const hours = Math.floor(content_offset / 3600) === 0 ? '' : Math.floor(content_offset / 3600) + ':';
        const minutes = Math.floor((content_offset / 60) % 60).toString().padStart(hours ? 2 : 1, '0');
        const seconds = Math.floor(content_offset % 60).toString().padStart(2, '0');
        return `${hours}${minutes}:${seconds} `;
    };

    const formatFragment = (fragment: any, i: number) => {
        if (fragment.emoticon) {
            const emoticonId = fragment.emoticon.emoticon_id;
            return <TwitchEmote
                key={i}
                emoteId={emoticonId}
                text={fragment.text}
            />;
        }
        const words = fragment.text.split(' ');

        const modifiers: { [key: string]: string } = {
            'w!': ' modifier-wide',
            'v!': ' modifier-vertical',
            'h!': ' modifier-horizontal',
            'z!': ' modifier-zero-space'
        };
        return <span key={i}>
            {words.map((word: string, j: number) => {
                const previousWord = words[j - 1] ?? null;
                const nextWord = words[j + 1] ?? null;

                if (modifiers[word] && bttvEmotes && nextWord && bttvEmotes[nextWord]) {
                    return <span key={`${i}-${j}`}></span>;
                }

                if (bttvEmotes && bttvEmotes[word]) {
                    return <BttvEmote
                        key={`${i}-${j}`}
                        emoteId={bttvEmotes[word]}
                        text={word}
                        modifier={modifiers[previousWord]}
                    />;
                }
                return <span key={`${i}-${j}`}>
                    {word + ' '}
                </span>;
            })}
        </span>;
    };

    const commenterName = message.commenter?.display_name || 'UNKNOWN';
    const fragments = message.message?.fragments || [{ text: message.message.body }];

    return (
        <div className='chat-message'>
            <span className='chat-message-time'>{formatTimestamp(message.content_offset_seconds)}</span>
            <span className='chat-message-body'>
                <UserBadges message={message} badgeMap={badgeMap} />
                <span className='commenter' style={{ color: getColor(commenterName) }}>{commenterName}</span>
                <span className='message-content'>: </span>
                {fragments.map(formatFragment)}
            </span>
        </div>
    );
};

export default ChatMessage;
