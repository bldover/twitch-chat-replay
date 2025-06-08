import { ChatMessage, BadgeMap } from '../types';

export type BadgeConfig = {
    id: string;
    version?: string;
    title: string;
    src: string;
    type: string;
};

export const hasBadge = (message: ChatMessage, badgeId: string, badgeVersion?: string): boolean => {
    const badges = message.message.user_badges;
    return !!(badges && badges.some((badge) =>
        badge._id === badgeId && (!badgeVersion || badge.version === badgeVersion)
    ));
};

export const getUserBadges = (message: ChatMessage, badgeMap: BadgeMap | null): BadgeConfig[] => {
    if (!badgeMap || !message.message.user_badges) {
        return [];
    }

    const badges: BadgeConfig[] = [];

    message.message.user_badges.forEach(userBadge => {
        const key = `${userBadge._id}#${userBadge.version}`;
        const badgeVersion = badgeMap[key];
        if (badgeVersion) {
            badges.push({
                id: userBadge._id,
                version: userBadge.version,
                title: badgeVersion.title,
                src: badgeVersion.image_url_1x,
                type: 'twitch'
            });
        }
    });

    return badges;
};
