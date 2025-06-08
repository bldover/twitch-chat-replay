import './Emote.css';
import { FC } from 'react';

type BttvEmoteProps = {
    emoteId: string;
    text: string;
    fragmentIndex: number;
    wordIndex: number;
    modifier?: string;
};

const BttvEmote: FC<BttvEmoteProps> = ({ emoteId, text, fragmentIndex, wordIndex, modifier }) => {
    const className = 'emoticon' + (modifier ?? '');

    return (
        <span key={`${fragmentIndex}-${wordIndex}-${text}-bttv`}>
            <img
                alt={text}
                title={text}
                className={className}
                src={`https://cdn.betterttv.net/emote/${emoteId}/1x`}
                srcSet={[
                    `https://cdn.betterttv.net/emote/${emoteId}/1x 1x`,
                    `https://cdn.betterttv.net/emote/${emoteId}/2x 2x`,
                    `https://cdn.betterttv.net/emote/${emoteId}/3x 3x`
                ].join(',')}
            />
            <span> </span>
        </span>
    );
};

export default BttvEmote;