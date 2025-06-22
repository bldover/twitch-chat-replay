import { useState, useEffect, useMemo } from 'react';
import { populateBadgeData, BadgeMaps, BadgeMap, BadgeConfig } from '../utils/badges';
import { useSettings } from '../contexts/SettingsContext';

export const useBadges = (broadcaster: string | null) => {
    const [badgeMaps, setBadgeMaps] = useState<BadgeMaps | null>(null);
    const { settings, updateBadgeSettings } = useSettings();

    useEffect(() => {
        populateBadgeData().then(maps => {
            setBadgeMaps(maps);
        })
    }, []);

    const activeBadgeMap = useMemo<BadgeMap | null>(() => {
        if (!badgeMaps || !broadcaster) return null;

        const fullBadgeMap = broadcaster === "Northernlion" ? badgeMaps.nl : badgeMaps.global;
        if (!fullBadgeMap) return null;

        const filteredMap: BadgeMap = {};

        Object.entries(fullBadgeMap).forEach(([key, badgeConfig]: [string, BadgeConfig]) => {
            const shouldInclude = (() => {
                switch (badgeConfig.category) {
                    case 'user_states':
                        return settings.badges.showUserStates;
                    case 'donations':
                        return settings.badges.showDonations;
                    case 'sub_tiers':
                        return settings.badges.showSubTiers;
                    case 'predictions':
                        return settings.badges.showPredictions;
                    case 'events':
                        return settings.badges.showEvents;
                    default:
                        return true;
                }
            })();

            if (shouldInclude) {
                filteredMap[key] = badgeConfig;
            }
        });

        return filteredMap;
    }, [badgeMaps, broadcaster, settings.badges]);

    return {
        badgeMap: activeBadgeMap,
        updateBadgeSettings
    };
};
