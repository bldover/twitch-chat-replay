import { BadgeMap, BadgeSet, BadgeMaps, BadgeCategory } from '../types';
import globalBadges from '../data/badges/global.json';
import nlBadges from '../data/badges/northernlion.json';

export type BadgeSettings = {
    showUserStates: boolean;
    showDonations: boolean;
    showSubTiers: boolean;
    showPredictions: boolean;
    showEvents: boolean;
};

const createBadgeMapFromSets = (badgeSets: BadgeSet[]): BadgeMap => {
    const badgeMap: BadgeMap = {};
    badgeSets.forEach(badgeSet => {
        badgeSet.versions.forEach(version => {
            const key = `${badgeSet.set_id}#${version.id}`;
            const category = getBadgeCategory(badgeSet.set_id);
            badgeMap[key] = {
                id: badgeSet.set_id,
                version: version.id,
                title: version.title,
                src: version.image_url_1x,
                category
            };
        });
    });
    return badgeMap;
};

export const populateBadgeData = async (): Promise<BadgeMaps> => {
    const globalBadgeSets = globalBadges as BadgeSet[];
    const nlBadgeSets = nlBadges as BadgeSet[];

    const globalMap = createBadgeMapFromSets(globalBadgeSets);
    const nlMap = createBadgeMapFromSets([...globalBadgeSets, ...nlBadgeSets]);

    return {
        global: globalMap,
        nl: nlMap
    };
};

const userTypeBadges: string[] = ['admin', 'staff', 'moderator', 'broadcaster', 'verified', 'vip', 'ambassador', 'turbo', 'premium', 'game-developer', 'global_mod', 'no_audio', 'no_video', 'partner', 'twitch-dj', 'twitchbot', 'artist-badge', 'extension', 'user_anniversary'];
const donationBadges: string[] = ['bits', 'bits-leader', 'sub-gifter', 'sub-gift-leader', 'cheer', 'anonymous-cheerer', 'hype-train'];
const subBadges: string[] = ['subscriber', 'founder'];
const predictionBadges: string[] = ['predictions'];

export const getBadgeCategory = (badgeId: string): BadgeCategory => {
    if (userTypeBadges.includes(badgeId)) {
        return 'user_states';
    }

    if (donationBadges.includes(badgeId)) {
        return 'donations';
    }

    if (subBadges.includes(badgeId)) {
        return 'sub_tiers';
    }

    if (predictionBadges.includes(badgeId)) {
        return 'predictions';
    }

    return 'events';
};
