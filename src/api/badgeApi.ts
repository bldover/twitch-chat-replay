import { BadgeSet, BadgeMap, BadgeMaps } from '../types';
import globalBadges from '../data/badges/global.json';
import northernlionBadges from '../data/badges/northernlion.json';

const NORTHERNLION_AUTHORS = ['Northernlion'];

export const isNorthernlionAuthor = (author: string): boolean => {
    return NORTHERNLION_AUTHORS.includes(author);
};

const createBadgeMapFromSets = (badgeSets: BadgeSet[]): BadgeMap => {
    const badgeMap: BadgeMap = {};
    badgeSets.forEach(badgeSet => {
        badgeSet.versions.forEach(version => {
            const key = `${badgeSet.set_id}#${version.id}`;
            badgeMap[key] = version;
        });
    });
    return badgeMap;
};

export const fetchBadgeData = async (): Promise<BadgeMaps> => {
    const globalBadgeSets = globalBadges as BadgeSet[];
    const northernlionBadgeSets = northernlionBadges as BadgeSet[];
    
    const globalMap = createBadgeMapFromSets(globalBadgeSets);
    const globalPlusNorthernlionMap = createBadgeMapFromSets([...globalBadgeSets, ...northernlionBadgeSets]);
    
    return {
        global: globalMap,
        globalPlusNorthernlion: globalPlusNorthernlionMap
    };
};

export const getBadgeMapForAuthor = (badgeMaps: BadgeMaps | null, author: string): BadgeMap | null => {
    if (!badgeMaps) return null;
    return isNorthernlionAuthor(author) ? badgeMaps.globalPlusNorthernlion : badgeMaps.global;
};