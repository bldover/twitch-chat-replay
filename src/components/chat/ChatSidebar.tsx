import './ChatSidebar.css'
import { FC, useState, useRef, useEffect } from 'react'
import Chat from './Chat'
import ChatSelector from './ChatSelector'
import Settings from '../settings/Settings'
import ChatHeader from './ChatHeader'
import ChatNotification from './ChatNotification'
import { ChatMessage, VodSummary, VideoMetadata, ChatData, Theme, VodState, BadgeMap, ChatPosition } from '../../types'
import { BadgeSettings } from '../../utils/badges'
import { useVodSelector } from '../../hooks/useVodSelector'

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
    updateChatWidth: (width: number) => void
    updateChatHeight: (height: number) => void
    updateBadgeSettings: (badges: BadgeSettings) => void
    badgeMap: BadgeMap | null
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
    updateChatWidth,
    updateChatHeight,
    updateBadgeSettings,
    badgeMap
}) => {
    const [isHeaderMinimized, setIsHeaderMinimized] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [showScrollbar, setShowScrollbar] = useState(false)
    const [searchFilter, setSearchFilter] = useState<string>('')
    const hideScrollbarTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    const hasMessages = vodState.messages !== null

    const vodSelector = useVodSelector({
        vodSummaries: vodState.vodSummaries,
        selectedVod: vodState.selectedVod,
        hasMessages,
        isVideoPlaying,
        videoMetadata,
        searchFilter,
        onSelectVod: onSelectKnownVod,
        onResetVod: onReset
    })

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
        vodSelector.selectVod(summary)
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
        setSearchFilter('')
        vodSelector.resetVod()
    }

    useEffect(() => {
        if (!hasMessages && scrollContainerRef.current) {
            scrollContainerRef.current.scrollTop = 0
        }
    }, [hasMessages])

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
                {vodSelector.shouldShowNotification && vodSelector.notificationData && (
                    <ChatNotification
                        message={vodSelector.notificationData.message}
                        details={vodSelector.notificationData.details}
                        type={vodSelector.notificationData.type}
                    />
                )}

                {vodSelector.shouldShowChat && (
                    <Chat
                        chatMessages={messagesToRender}
                        bttvEmotes={vodState.currentVodBttvEmotes}
                        badgeMap={badgeMap}
                    />
                )}

                {vodSelector.shouldShowVodSelector && vodSelector.vodSelectorData && (
                    <ChatSelector
                        vodSummaries={vodSelector.vodSelectorData.summaries}
                        onSelectKnownJson={handleSelectKnownVod}
                        showMatchScores={vodSelector.vodSelectorData.showMatchScores}
                    />
                )}
            </div>

            <Settings
                isOpen={isSettingsOpen}
                onClose={handleCloseSettings}
                updateChatDelay={updateChatDelay}
                updateTheme={updateTheme}
                updateChatPosition={updateChatPosition}
                updateChatWidth={updateChatWidth}
                updateChatHeight={updateChatHeight}
                updateBadgeSettings={updateBadgeSettings}
            />
        </div>
    )
}

export default ChatSidebar
