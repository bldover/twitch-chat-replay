import './UserBadges.css';
import { FC } from 'react';
import { ChatMessage, BadgeMap } from '../../types';

type UserBadgesProps = {
    message: ChatMessage;
    badgeMap: BadgeMap | null;
};

const UserBadges: FC<UserBadgesProps> = ({ message, badgeMap }) => {
    if (!badgeMap || !message.message.user_badges) {
        return null;
    }

    const badges = message.message.user_badges
        .map(userBadge => {
            const key = `${userBadge._id}#${userBadge.version}`;
            return badgeMap[key] || null;
        })
        .filter((badge): badge is NonNullable<typeof badge> => badge !== null);

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
