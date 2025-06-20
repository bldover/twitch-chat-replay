import './ChatSidebar.css'
import { FC, useState, useRef, useEffect } from 'react'
import Chat from './Chat'
import ChatSelector from './ChatSelector'
import Settings from '../settings/Settings'
import ChatHeader from './ChatHeader'
import ChatNotification from './ChatNotification'
import { ChatMessage, VodSummary, VideoMetadata, ChatData, Theme, VodState, BadgeMap, NotificationState, ChatPosition } from '../../types'
import { BadgeSettings } from '../../utils/badges'
import { getChatSelectionMode, getAutoSelectConfig } from '../../utils/settings'
import { filterAndRankChatOptions } from '../../utils/chatMatcher'

interface ChatSidebarProps {
    vodState: VodState
    messagesToRender: ChatMessage[]
    onReset: () => void
    onSelectKnownVod: (summary: VodSummary) => void
    onUploadCustomVod: (json: ChatData) => void
    videoMetadata: VideoMetadata | null
    isVideoPlaying?: boolean
    updateChatDelay: (delay: number) => void
    updateTheme: (theme: Theme) => void
    updateChatPosition: (position: ChatPosition) => void
    updateBadgeSettings: (badges: BadgeSettings) => void
    badgeMap: BadgeMap | null
    evaluateAutoSelect: (videoMetadata: VideoMetadata | null) => VodSummary | null
}

const ChatSidebar: FC<ChatSidebarProps> = ({
    vodState,
    messagesToRender,
    onReset,
    onSelectKnownVod,
    onUploadCustomVod,
    videoMetadata,
    isVideoPlaying = false,
    updateChatDelay,
    updateTheme,
    updateChatPosition,
    updateBadgeSettings,
    badgeMap,
    evaluateAutoSelect
}) => {
    const [isHeaderMinimized, setIsHeaderMinimized] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [showScrollbar, setShowScrollbar] = useState(false)
    const [searchFilter, setSearchFilter] = useState<string>('')
    const [startedPlaying, setStartedPlaying] = useState<boolean>(false)
    const [autoSelectNotification, setAutoSelectNotification] = useState<{ vod: VodSummary; matchPercent: number } | null>(null)
    const hideScrollbarTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    const hasMessages = vodState.messages !== null

    const handleMinimizeHeader = () => {
        setIsHeaderMinimized(true)
    }

    const handleExpandHeader = () => {
        setIsHeaderMinimized(false)
    }

    const handleSettingsClick = () => {
        setIsSettingsOpen(true)
    }

    const handleCloseSettings = () => {
        setIsSettingsOpen(false)
    }

    const handleSelectKnownVod = (summary: VodSummary) => {
        setSearchFilter('')
        onSelectKnownVod(summary)
    }

    const handleMouseEnter = () => {
        if (hideScrollbarTimeoutRef.current) {
            clearTimeout(hideScrollbarTimeoutRef.current)
            hideScrollbarTimeoutRef.current = null
        }
        setShowScrollbar(true)
    }

    const handleMouseLeave = () => {
        hideScrollbarTimeoutRef.current = setTimeout(() => {
            setShowScrollbar(false)
        }, 2000)
    }

    const handleReset = () => {
        setStartedPlaying(false)
        setAutoSelectNotification(null)
        onReset()
    }

    useEffect(() => {
        if (!hasMessages && scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = 0
        }
    }, [hasMessages])

    useEffect(() => {
        if (!startedPlaying && isVideoPlaying) {
            setStartedPlaying(true)
        }
    }, [isVideoPlaying, startedPlaying])

    useEffect(() => {
        if (videoMetadata && !vodState.selectedVod) {
            const autoSelectedVod = evaluateAutoSelect(videoMetadata);
            if (autoSelectedVod) {
                const autoSelectConfig = getAutoSelectConfig();
                if (autoSelectConfig.autoSelectNotificationDuration > 0) {
                    setAutoSelectNotification({
                        vod: autoSelectedVod,
                        matchPercent: autoSelectedVod.matchScore || 0
                    });
                }
                onSelectKnownVod(autoSelectedVod);
            }
        }
    }, [videoMetadata, vodState.selectedVod, evaluateAutoSelect, onSelectKnownVod])

    useEffect(() => {
        if (autoSelectNotification) {
            const autoSelectConfig = getAutoSelectConfig();
            if (autoSelectConfig.autoSelectNotificationDuration > 0) {
                const timeoutId = setTimeout(() => {
                    setAutoSelectNotification(null);
                }, autoSelectConfig.autoSelectNotificationDuration * 1000);

                return () => clearTimeout(timeoutId);
            }
        }
    }, [autoSelectNotification])

    const getNotificationState = (): NotificationState | null => {
        if (autoSelectNotification) {
            return {
                type: 'auto-select',
                message: `${autoSelectNotification.vod.title}`,
                details: `${autoSelectNotification.vod.created_at.slice(0, 10)} • Match: ${autoSelectNotification.matchPercent}%`,
                notificationType: 'info'
            };
        }

        if (vodState.selectedVod && !startedPlaying && hasMessages) {
            console.log('waiting')
            return {
                type: 'waiting',
                message: vodState.selectedVod.title,
                details: 'Play a video to start the chat replay',
                notificationType: 'info'
            };
        }

        const chatMode = getChatSelectionMode();
        const isAutoMode = chatMode === 'auto-search' || chatMode === 'auto-select';
        if (isAutoMode && videoMetadata && searchFilter.length === 0) {
            const filteredSummaries = filterAndRankChatOptions(videoMetadata, vodState.vodSummaries);
            if (filteredSummaries.length === 0) {
                return {
                    type: 'no-match',
                    message: 'Unable to find any corresponding chats :(',
                    notificationType: 'error'
                };
            }
        }

        return null;
    };

    return (
        <div
            className='chat-sidebar'
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <ChatHeader
                hasMessages={hasMessages}
                isHeaderMinimized={isHeaderMinimized}
                searchFilter={searchFilter}
                onMinimizeHeader={handleMinimizeHeader}
                onExpandHeader={handleExpandHeader}
                onSettingsClick={handleSettingsClick}
                onSearchFilterChange={setSearchFilter}
                onUploadCustomVod={onUploadCustomVod}
                onReset={handleReset}
            />

            <div ref={scrollContainerRef} className={`chat-sidebar-content ${hasMessages ? 'chat-mode' : ''} ${showScrollbar ? 'scrollbar-visible' : ''}`}>
                {(() => {
                    const notificationState = getNotificationState();

                    if (notificationState) {
                        return (
                            <ChatNotification
                                message={notificationState.message}
                                details={notificationState.details}
                                type={notificationState.notificationType}
                            />
                        );
                    }

                    if (hasMessages) {
                        return (
                            <Chat
                                chatMessages={messagesToRender}
                                bttvEmotes={vodState.currentVodBttvEmotes}
                                badgeMap={badgeMap}
                            />
                        );
                    }

                    return (
                        <ChatSelector
                            vodSummaries={vodState.vodSummaries}
                            onSelectKnownJson={handleSelectKnownVod}
                            videoMetadata={videoMetadata}
                            searchFilter={searchFilter}
                        />
                    );
                })()}
            </div>

            <Settings
                isOpen={isSettingsOpen}
                onClose={handleCloseSettings}
                updateChatDelay={updateChatDelay}
                updateTheme={updateTheme}
                updateChatPosition={updateChatPosition}
                updateBadgeSettings={updateBadgeSettings}
            />
        </div>
    )
}

export default ChatSidebar
