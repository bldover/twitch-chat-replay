import { useState, useEffect, useCallback, useRef } from 'react';
import { VodSummary, VideoMetadata } from '../types';
import { getChatSelectionMode, getAutoSelectConfig } from '../utils/settings';
import { filterAndRankChatOptions, evaluateAutoSelection } from '../utils/chatMatcher';

export type VodSelectionState =
    | 'vod-search'
    | 'vod-auto-search'
    | 'vod-auto-search-error'
    | 'vod-selected-waiting'
    | 'vod-selected-notify'
    | 'vod-selected-playing';

interface NotificationData {
    message: string;
    details?: string;
    type: 'info' | 'error';
}

interface VodSelectorData {
    summaries: VodSummary[];
    showMatchScores: boolean;
}

interface AutoSelectNotification {
    vod: VodSummary;
    matchPercent: number;
}

interface UseVodSelectionProps {
    vodSummaries: VodSummary[];
    selectedVod: VodSummary | null;
    hasMessages: boolean;
    isVideoPlaying: boolean;
    videoMetadata: VideoMetadata | null;
    searchFilter: string;
    onSelectVod: (vod: VodSummary) => void;
}

export interface UseVodSelectionReturn {
    state: VodSelectionState;
    currentVod: VodSummary | null;
    shouldShowChat: boolean;
    shouldShowNotification: boolean;
    shouldShowVodSelector: boolean;
    notificationData: NotificationData | null;
    vodSelectorData: VodSelectorData | null;
    selectVod: (vod: VodSummary) => void;
    unselectVod: () => void;
    resetVodSelector: () => void;
}

export const useVodSelector = ({
    vodSummaries,
    selectedVod,
    hasMessages,
    isVideoPlaying,
    videoMetadata,
    searchFilter,
    onSelectVod
}: UseVodSelectionProps): UseVodSelectionReturn => {
    const [state, setState] = useState<VodSelectionState>('vod-search');
    const [autoSelectNotification, setAutoSelectNotification] = useState<AutoSelectNotification | null>(null);
    const [hasVideoEverPlayed, setHasVideoEverPlayed] = useState<boolean>(false);
    const notificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const setStateWithLog = useCallback((newState: VodSelectionState) => {
        setState(prevState => {
            if (prevState !== newState) {
                console.debug(`[useVodSelector] ${newState}`);
            }
            return newState;
        });
    }, []);

    const getSearchFilteredSummaries = useCallback((): VodSummary[] => {
        if (!searchFilter) return vodSummaries;

        const filterFunction = (summary: VodSummary): boolean => {
            const videoTitle = summary.title.toLowerCase();
            const parts = searchFilter.toLowerCase().split(' ');
            return parts.every((part) => videoTitle.includes(part));
        };

        return vodSummaries.filter(filterFunction);
    }, [vodSummaries, searchFilter]);

    const getAutoFilteredSummaries = useCallback((): VodSummary[] => {
        if (!videoMetadata) return [];
        return filterAndRankChatOptions(videoMetadata, vodSummaries);
    }, [videoMetadata, vodSummaries]);

    const shouldUseAutoMode = useCallback((): boolean => {
        const chatMode = getChatSelectionMode();
        return (chatMode === 'auto-search' || chatMode === 'auto-select') &&
            videoMetadata !== null &&
            searchFilter === '';
    }, [videoMetadata, searchFilter]);

    const getAutoSelectResult = useCallback((): VodSummary | null => {
        const chatMode = getChatSelectionMode();
        if (chatMode !== 'auto-select' || !videoMetadata) return null;

        console.debug('evaluateAutoSelect', videoMetadata);
        const rankedMatches = filterAndRankChatOptions(videoMetadata, vodSummaries);
        const autoSelectConfig = getAutoSelectConfig();
        const autoSelectResult = evaluateAutoSelection(rankedMatches, autoSelectConfig);

        if (autoSelectResult.shouldAutoSelect && autoSelectResult.selectedVod) {
            return autoSelectResult.selectedVod;
        }

        return null;
    }, [videoMetadata, vodSummaries]);

    const performAutoSelect = useCallback((vod: VodSummary) => {
        setHasVideoEverPlayed(false);
        setAutoSelectNotification({
            vod: vod,
            matchPercent: vod.matchScore || 0
        });
        onSelectVod(vod);
    }, [onSelectVod]);

    const clearNotificationTimeout = useCallback(() => {
        if (notificationTimeoutRef.current) {
            clearTimeout(notificationTimeoutRef.current);
            notificationTimeoutRef.current = null;
        }
    }, []);

    const setNotificationTimeout = useCallback(() => {
        clearNotificationTimeout();
        const autoSelectConfig = getAutoSelectConfig();
        if (autoSelectConfig.autoSelectNotificationDuration > 0) {
            notificationTimeoutRef.current = setTimeout(() => {
                setAutoSelectNotification(null);
                setStateWithLog('vod-selected-playing');
            }, autoSelectConfig.autoSelectNotificationDuration * 1000);
        }
    }, [clearNotificationTimeout, setStateWithLog]);

    useEffect(() => {
        const chatMode = getChatSelectionMode();

        switch (state) {
            case 'vod-search':
                if (selectedVod && hasMessages) {
                    // vod selected before video played
                    if (isVideoPlaying || hasVideoEverPlayed) {
                        if (isVideoPlaying && !hasVideoEverPlayed) {
                            setHasVideoEverPlayed(true);
                        }
                        setStateWithLog('vod-selected-playing');
                    } else {
                        setStateWithLog('vod-selected-waiting');
                    }
                }

                if (searchFilter !== '') {
                    // actively searching
                    return;
                }

                if (videoMetadata && shouldUseAutoMode()) {
                    // video selected so try to auto select
                    if (chatMode === 'auto-select') {
                        const autoSelectedVod = getAutoSelectResult();
                        if (autoSelectedVod) {
                            performAutoSelect(autoSelectedVod);
                            const autoSelectConfig = getAutoSelectConfig();
                            if (autoSelectConfig.autoSelectNotificationDuration > 0) {
                                setStateWithLog('vod-selected-notify');
                            } else {
                                setStateWithLog('vod-selected-playing');
                            }
                            return;
                        }
                    }

                    const autoFiltered = getAutoFilteredSummaries();
                    if (autoFiltered.length === 0) {
                        setStateWithLog('vod-auto-search-error');
                    } else {
                        setStateWithLog('vod-auto-search');
                    }
                }
                break;

            case 'vod-auto-search':
                if (searchFilter !== '') {
                    // change back to regular search to enable searching through all vods
                    setStateWithLog('vod-search');
                    setAutoSelectNotification(null);
                    clearNotificationTimeout();
                    return;
                }

                if (!shouldUseAutoMode()) {
                    // auto search mode was just disabled
                    setStateWithLog('vod-search');
                    return;
                }

                if (selectedVod && hasMessages) {
                    // YT autoplay is enabled so waiting is typically not used but keep it just in case
                    if (isVideoPlaying || hasVideoEverPlayed) {
                        if (isVideoPlaying && !hasVideoEverPlayed) {
                            setHasVideoEverPlayed(true);
                        }
                        setStateWithLog('vod-selected-playing');
                    } else {
                        setStateWithLog('vod-selected-waiting');
                    }
                }
                break;

            case 'vod-auto-search-error':
                if (searchFilter !== '') {
                    // auto search didn't find anything so let the user search
                    setStateWithLog('vod-search');
                    setAutoSelectNotification(null);
                    clearNotificationTimeout();
                    return;
                }

                if (!shouldUseAutoMode()) {
                    // auto search mode was disabled
                    setStateWithLog('vod-search');
                    return;
                }
                break;

            case 'vod-selected-waiting':
                if (isVideoPlaying || hasVideoEverPlayed) {
                    // video started so start displaying the chat
                    if (isVideoPlaying && !hasVideoEverPlayed) {
                        setHasVideoEverPlayed(true);
                    }
                    setStateWithLog('vod-selected-playing');
                }
                break;

            case 'vod-selected-notify':
                // timeout will handle state transition
                break;

            case 'vod-selected-playing':
                // terminal state, only reset will move out
                break;

            default:
                setStateWithLog('vod-search');
                break;
        }
    }, [
        state,
        searchFilter,
        selectedVod,
        videoMetadata,
        hasMessages,
        isVideoPlaying,
        hasVideoEverPlayed,
        shouldUseAutoMode,
        getAutoSelectResult,
        performAutoSelect,
        getAutoFilteredSummaries,
        setStateWithLog,
        clearNotificationTimeout
    ]);

    const handleNotificationTimeout = useCallback(() => {
        if (state === 'vod-selected-notify' && autoSelectNotification) {
            setNotificationTimeout();
        } else {
            clearNotificationTimeout();
        }
    }, [state, autoSelectNotification, setNotificationTimeout, clearNotificationTimeout]);

    useEffect(() => {
        handleNotificationTimeout();
        return clearNotificationTimeout;
    }, [handleNotificationTimeout, clearNotificationTimeout]);

    const selectVod = useCallback((vod: VodSummary) => {
        onSelectVod(vod);
        setAutoSelectNotification(null);
        clearNotificationTimeout();
        setHasVideoEverPlayed(false);
    }, [onSelectVod, clearNotificationTimeout]);

    const unselectVod = useCallback(() => {
        setAutoSelectNotification(null);
        clearNotificationTimeout();
        setStateWithLog('vod-search');
    }, [clearNotificationTimeout, setStateWithLog]);

    const resetAll = useCallback(() => {
        setAutoSelectNotification(null);
        clearNotificationTimeout();
        setHasVideoEverPlayed(false);
        setStateWithLog('vod-search');
    }, [clearNotificationTimeout, setStateWithLog]);

    const getUiState = () => {
        switch (state) {
            case 'vod-search':
                return {
                    shouldShowVodSelector: true,
                    vodSelectorData: {
                        summaries: getSearchFilteredSummaries(),
                        showMatchScores: false
                    }
                };

            case 'vod-auto-search':
                return {
                    shouldShowVodSelector: true,
                    vodSelectorData: {
                        summaries: getAutoFilteredSummaries(),
                        showMatchScores: true
                    }
                };

            case 'vod-auto-search-error':
                return {
                    shouldShowNotification: true,
                    notificationData: {
                        message: 'Unable to find any corresponding chats :(',
                        type: 'error' as const
                    }
                };

            case 'vod-selected-waiting':
                return {
                    shouldShowNotification: true,
                    notificationData: {
                        message: selectedVod?.title || '',
                        details: 'Play a video to start the chat replay',
                        type: 'info' as const
                    }
                };

            case 'vod-selected-notify':
                return {
                    shouldShowNotification: true,
                    notificationData: autoSelectNotification ? {
                        message: autoSelectNotification.vod.title,
                        details: `${autoSelectNotification.vod.created_at.slice(0, 10)} • Match: ${autoSelectNotification.matchPercent}%`,
                        type: 'info' as const
                    } : null
                };

            case 'vod-selected-playing':
                return {
                    shouldShowChat: true
                };

            default:
                return {};
        }
    };

    const uiState = getUiState();

    return {
        state,
        currentVod: selectedVod,
        shouldShowChat: uiState.shouldShowChat || false,
        shouldShowNotification: uiState.shouldShowNotification || false,
        shouldShowVodSelector: uiState.shouldShowVodSelector || false,
        notificationData: uiState.notificationData || null,
        vodSelectorData: uiState.vodSelectorData || null,
        selectVod,
        unselectVod: unselectVod,
        resetVodSelector: resetAll
    };
};
