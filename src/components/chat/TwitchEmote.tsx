import './Emote.css';
import { FC } from 'react';
import { hashCode } from '../../utils/hash';

type TwitchEmoteProps = {
    emoteId: string;
    text: string;
    fragmentIndex: number;
};

const TwitchEmote: FC<TwitchEmoteProps> = ({ emoteId, text, fragmentIndex }) => {

    return (
        <img
            key={hashCode((fragmentIndex.toString() + text))}
            alt={text}
            title={text}
            className='emoticon'
            src={`https://static-cdn.jtvnw.net/emoticons/v1/${emoteId}/1.0`}
            srcSet={[
                `https://static-cdn.jtvnw.net/emoticons/v1/${emoteId}/1.0 1x`,
                `https://static-cdn.jtvnw.net/emoticons/v1/${emoteId}/2.0 2x`,
                `https://static-cdn.jtvnw.net/emoticons/v1/${emoteId}/3.0 4x`
            ].join(',')}
        />
    );
};

export default TwitchEmote;
