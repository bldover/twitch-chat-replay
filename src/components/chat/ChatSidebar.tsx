import './ChatSidebar.css'
import { FC, useState, useRef, useEffect } from 'react'
import Chat from './Chat'
import ChatSelector from './ChatSelector'
import Settings from '../settings/Settings'
import ChatHeader from './ChatHeader'
import ChatNotification from './ChatNotification'
import ResizeHandle from './ResizeHandle'
import { ChatMessage, VodSummary, VideoMetadata, ChatData, Theme, VodState, BadgeMap } from '../../types'
import { BadgeSettings } from '../../utils/badges'
import { useVodSelector } from '../../hooks/useVodSelector'
import { UseChatPositionReturn } from '../../hooks/useChatPosition'

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
    updateBadgeSettings: (badges: BadgeSettings) => void
    badgeMap: BadgeMap | null
    chatPosition: UseChatPositionReturn
}

const ChatSidebar: FC<ChatSidebarProps> = ({
    vodState,
    messagesToRender,
    onReset,
    onSelectKnownVod,
    onUploadCustomVod,
    videoMetadata,
    isVideoPlaying,
    updateChatDelay,
    updateTheme,
    updateBadgeSettings,
    badgeMap,
    chatPosition
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
        isVideoPlaying: isVideoPlaying === true,
        videoMetadata,
        searchFilter,
        onSelectVod: onSelectKnownVod
    })

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

    const handleResizeWidth = (width: number) => {
        chatPosition.updateWidth(width)
    }

    const handleResizeHeight = (height: number) => {
        chatPosition.updateHeight(height)
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
                onMinimizeHeader={() => setIsHeaderMinimized(true)}
                onExpandHeader={() => setIsHeaderMinimized(false)}
                onSettingsClick={() => setIsSettingsOpen(true)}
                onSearchFilterChange={setSearchFilter}
                onUploadCustomVod={onUploadCustomVod}
                onReset={onReset}
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
                onClose={() => setIsSettingsOpen(false)}
                updateChatDelay={updateChatDelay}
                updateTheme={updateTheme}
                updateChatPosition={chatPosition.updatePosition}
                updateChatWidth={chatPosition.updateWidth}
                updateChatHeight={chatPosition.updateHeight}
                updateBadgeSettings={updateBadgeSettings}
            />

            <ResizeHandle
                chatPosition={chatPosition.position}
                currentWidth={chatPosition.width}
                currentHeight={chatPosition.height}
                onWidthChange={handleResizeWidth}
                onHeightChange={handleResizeHeight}
                onDragStart={chatPosition.startResize}
                onDragEnd={chatPosition.endResize}
            />
        </div>
    )
}

export default ChatSidebar
