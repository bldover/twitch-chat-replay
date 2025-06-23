import './ChatSidebar.css'
import { FC, useState, useRef, useEffect } from 'react'
import Chat from './Chat'
import ChatSelector from './ChatSelector'
import Settings from '../settings/Settings'
import ChatHeader from './ChatHeader'
import ChatNotification from './ChatNotification'
import ResizeHandle from './ResizeHandle'
import { VodSummary, VideoMetadata, ChatData, VodState } from '../../types'
import { VideoPlayerState } from '../../hooks/useVideoPlayer'
import { useVodSelector } from '../../hooks/useVodSelector'
import { useChatSync } from '../../hooks/useChatSync'
import { useBadges } from '../../hooks/useBadges'
import { UseChatPositionReturn } from '../../hooks/useChatPosition'

interface ChatSidebarProps {
    vodState: VodState
    onReset: () => void
    onSelectKnownVod: (summary: VodSummary) => void
    onUploadCustomVod: (json: ChatData) => void
    videoMetadata: VideoMetadata | null
    videoState: VideoPlayerState
    chatPosition: UseChatPositionReturn
}

const ChatSidebar: FC<ChatSidebarProps> = ({
    vodState,
    onReset,
    onSelectKnownVod,
    onUploadCustomVod,
    videoMetadata,
    videoState,
    chatPosition
}) => {
    const [isHeaderMinimized, setIsHeaderMinimized] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [showScrollbar, setShowScrollbar] = useState(false)
    const [searchFilter, setSearchFilter] = useState<string>('')
    const hideScrollbarTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    
    const hasMessages = vodState.messages !== null
    const { messagesToRender, chatEnabled } = useChatSync(vodState.messages, videoState)
    const { badgeMap } = useBadges(vodState.broadcaster)
    
    const vodSelector = useVodSelector({
        vodSummaries: vodState.vodSummaries,
        selectedVod: vodState.selectedVod,
        hasMessages,
        isVideoPlaying: chatEnabled,
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
            />

            <ResizeHandle
                chatPosition={chatPosition.actualPosition}
                currentWidth={chatPosition.width}
                currentHeight={chatPosition.height}
                onWidthChange={handleResizeWidth}
                onHeightChange={handleResizeHeight}
                onDragStart={chatPosition.startResize}
                onDragEnd={chatPosition.endResize}
                isAutoMode={chatPosition.isAutoMode}
            />
        </div>
    )
}

export default ChatSidebar
