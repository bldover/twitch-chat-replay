import { useState, useEffect, useCallback, useRef } from 'react';
import { VodSummary, VideoMetadata } from '../types';
import { getChatSelectionMode, getAutoSelectConfig } from '../utils/settings';
import { filterAndRankChatOptions } from '../utils/chatMatcher';

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
    evaluateAutoSelect: (videoMetadata: VideoMetadata | null) => VodSummary | null;
    onSelectVod: (vod: VodSummary) => void;
    onResetVod: () => void;
}

interface UseVodSelectionReturn {
    state: VodSelectionState;
    currentVod: VodSummary | null;
    shouldShowChat: boolean;
    shouldShowNotification: boolean;
    shouldShowVodSelector: boolean;
    notificationData: NotificationData | null;
    vodSelectorData: VodSelectorData | null;
    selectVod: (vod: VodSummary) => void;
    resetVod: () => void;
}

export const useVodSelector = ({
    vodSummaries,
    selectedVod,
    hasMessages,
    isVideoPlaying,
    videoMetadata,
    searchFilter,
    evaluateAutoSelect,
    onSelectVod,
    onResetVod
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

    const attemptAutoSelect = useCallback((): boolean => {
        const chatMode = getChatSelectionMode();
        if (chatMode !== 'auto-select' || !videoMetadata) return false;

        const autoSelectedVod = evaluateAutoSelect(videoMetadata);
        if (autoSelectedVod) {
            const autoSelectConfig = getAutoSelectConfig();
            setHasVideoEverPlayed(false);
            if (autoSelectConfig.autoSelectNotificationDuration > 0) {
                setAutoSelectNotification({
                    vod: autoSelectedVod,
                    matchPercent: autoSelectedVod.matchScore || 0
                });
                setStateWithLog('vod-selected-notify');
            } else {
                setStateWithLog('vod-selected-playing');
            }
            onSelectVod(autoSelectedVod);
            return true;
        }
        return false;
    }, [videoMetadata, evaluateAutoSelect, onSelectVod, setStateWithLog]);

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

    const updateState = useCallback(() => {
        const chatMode = getChatSelectionMode();

        if (!selectedVod && !videoMetadata) {
            setStateWithLog('vod-search');
            return;
        }

        if (selectedVod && hasMessages) {
            if (state === 'vod-selected-notify') {
                // don't change until configured timeout
                return;
            }

            if (isVideoPlaying) {
                if (!hasVideoEverPlayed) {
                    setHasVideoEverPlayed(true);
                }
                setStateWithLog('vod-selected-playing');
            } else {
                if (!hasVideoEverPlayed) {
                    setStateWithLog('vod-selected-waiting');
                } else {
                    setStateWithLog('vod-selected-playing');
                }
            }
            return;
        }

        if (!selectedVod) {
            if (shouldUseAutoMode()) {
                if (chatMode === 'auto-select') {
                    if (attemptAutoSelect()) {
                        return;
                    }
                }

                const autoFiltered = getAutoFilteredSummaries();
                if (autoFiltered.length === 0) {
                    setStateWithLog('vod-auto-search-error');
                } else {
                    setStateWithLog('vod-auto-search');
                }
            } else {
                setStateWithLog('vod-search');
            }
        }
    }, [
        selectedVod,
        hasMessages,
        isVideoPlaying,
        state,
        shouldUseAutoMode,
        attemptAutoSelect,
        getAutoFilteredSummaries,
        videoMetadata,
        setStateWithLog,
        hasVideoEverPlayed
    ]);

    useEffect(() => {
        if (searchFilter !== '') {
            setStateWithLog('vod-search');
            setAutoSelectNotification(null);
            clearNotificationTimeout();
        } else {
            updateState();
        }
    }, [searchFilter, updateState, clearNotificationTimeout, setStateWithLog]);

    useEffect(() => {
        updateState();
    }, [updateState]);

    useEffect(() => {
        if (state === 'vod-selected-notify' && autoSelectNotification) {
            setNotificationTimeout();
        } else {
            clearNotificationTimeout();
        }

        return clearNotificationTimeout;
    }, [state, autoSelectNotification, setNotificationTimeout, clearNotificationTimeout]);

    useEffect(() => {
        if (selectedVod && videoMetadata) {
            if (state === 'vod-selected-notify') {
                // don't change until configured timeout
                return;
            }

            const chatMode = getChatSelectionMode();

            if (chatMode === 'manual') {
                if (isVideoPlaying) {
                    if (!hasVideoEverPlayed) {
                        setHasVideoEverPlayed(true);
                    }
                    setStateWithLog('vod-selected-playing');
                } else {
                    setStateWithLog('vod-selected-playing');
                }
            } else {
                if (isVideoPlaying) {
                    if (!hasVideoEverPlayed) {
                        setHasVideoEverPlayed(true);
                    }
                    setStateWithLog('vod-selected-playing');
                } else {
                    setStateWithLog('vod-selected-playing');
                }
            }
        }
    }, [videoMetadata, selectedVod, isVideoPlaying, setStateWithLog, hasVideoEverPlayed, state]);

    const selectVod = useCallback((vod: VodSummary) => {
        onSelectVod(vod);
        setAutoSelectNotification(null);
        clearNotificationTimeout();
        setHasVideoEverPlayed(false);
    }, [onSelectVod, clearNotificationTimeout]);

    const resetVod = useCallback(() => {
        onResetVod();
        setAutoSelectNotification(null);
        clearNotificationTimeout();
        setHasVideoEverPlayed(false);
        setStateWithLog('vod-search');
    }, [onResetVod, clearNotificationTimeout, setStateWithLog]);

    const getUIState = () => {
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

    const uiState = getUIState();

    return {
        state,
        currentVod: selectedVod,
        shouldShowChat: uiState.shouldShowChat || false,
        shouldShowNotification: uiState.shouldShowNotification || false,
        shouldShowVodSelector: uiState.shouldShowVodSelector || false,
        notificationData: uiState.notificationData || null,
        vodSelectorData: uiState.vodSelectorData || null,
        selectVod,
        resetVod
    };
};
