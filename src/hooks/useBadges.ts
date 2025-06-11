import { useState, useEffect, useMemo } from 'react';
import { BadgeMaps, BadgeMap, BadgeConfig } from '../types';
import { BadgeSettings, populateBadgeData } from '../utils/badges';
import { getBadgeSettings, setBadgeSettings as saveSettings } from '../utils/settings';

export const useBadges = (broadcaster: string | null) => {
    const [badgeMaps, setBadgeMaps] = useState<BadgeMaps | null>(null);
    const [badgeSettings, setBadgeSettingsState] = useState<BadgeSettings>(getBadgeSettings());

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
                        return badgeSettings.showUserStates;
                    case 'donations':
                        return badgeSettings.showDonations;
                    case 'sub_tiers':
                        return badgeSettings.showSubTiers;
                    case 'predictions':
                        return badgeSettings.showPredictions;
                    case 'events':
                        return badgeSettings.showEvents;
                    default:
                        return true;
                }
            })();

            if (shouldInclude) {
                filteredMap[key] = badgeConfig;
            }
        });

        return filteredMap;
    }, [badgeMaps, broadcaster, badgeSettings]);

    const updateBadgeSettings = (newSettings: BadgeSettings) => {
        setBadgeSettingsState(newSettings);
        saveSettings(newSettings);
    };

    return {
        badgeMap: activeBadgeMap,
        badgeSettings,
        updateBadgeSettings
    };
};
