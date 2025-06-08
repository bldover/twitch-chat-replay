import './UserBadges.css';
import { FC } from 'react';
import { ChatMessage, BadgeMap } from '../../types';
import { getUserBadges } from '../../utils/badges';

type UserBadgesProps = {
    message: ChatMessage;
    badgeMap: BadgeMap | null;
};

const UserBadges: FC<UserBadgesProps> = ({ message, badgeMap }) => {
    const badges = getUserBadges(message, badgeMap);

    if (badges.length === 0) {
        return null;
    }

    return (
        <span className='user-badges'>
            {badges.map((badge) => (
                <img
                    key={`${badge.id}-${badge.version || 'default'}`}
                    alt={badge.title}
                    title={badge.title}
                    src={badge.src}
                    className='badge'
                />
            ))}
        </span>
    );
};

export default UserBadges;
