import './Emote.css';
import { FC } from 'react';
import { NormalizedEmote } from '../../types';

type EmoteProps = {
    emote: NormalizedEmote;
    text: string;
    modifier?: string;
};

const Emote: FC<EmoteProps> = ({ emote, text, modifier }) => {
    const applyModifier = modifier && emote.source === 'bttv';
    const className = 'emoticon' + (applyModifier ? modifier : '');

    const srcSetParts: string[] = [];
    if (emote.urls['1x']) srcSetParts.push(`${emote.urls['1x']} 1x`);
    if (emote.urls['2x']) srcSetParts.push(`${emote.urls['2x']} 2x`);
    if (emote.urls['3x']) srcSetParts.push(`${emote.urls['3x']} 3x`);
    if (emote.urls['4x']) srcSetParts.push(`${emote.urls['4x']} 4x`);

    const customStyle: React.CSSProperties = {};
    if (emote.width && emote.height && !applyModifier) {
        customStyle.width = `${emote.width}px`;
        customStyle.height = `${emote.height}px`;
    }

    return (
        <span>
            <img
                alt={text}
                title={text}
                className={className}
                src={emote.urls['1x']}
                srcSet={srcSetParts.join(',')}
                style={customStyle}
            />
            <span> </span>
        </span>
    );
};

export default Emote;
