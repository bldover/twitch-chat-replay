import './ChatSidebar.css'
import { FC, useState, useRef, useEffect } from 'react'
import Chat from './Chat'
import ChatSelector from './ChatSelector'
import Settings from '../settings/Settings'
import ChatHeader from './ChatHeader'
import { ChatMessage, VodSummary, VideoMetadata, ChatData, Theme, VodState, BadgeMap } from '../../types'
import { BadgeSettings } from '../../utils/badges'

interface ChatSidebarProps {
    vodState: VodState
    messagesToRender: ChatMessage[]
    resetFunction: () => void
    onSelectKnownVod: (summary: VodSummary) => void
    onUploadCustomVod: (json: ChatData) => void
    videoMetadata: VideoMetadata | null
    isVideoPlaying?: boolean
    updateChatDelay: (delay: number) => void
    updateTheme: (theme: Theme) => void
    badgeSettings: BadgeSettings
    updateBadgeSettings: (badges: BadgeSettings) => void
    badgeMap: BadgeMap | null
}

const ChatSidebar: FC<ChatSidebarProps> = ({
    vodState,
    messagesToRender,
    resetFunction,
    onSelectKnownVod,
    onUploadCustomVod,
    videoMetadata,
    isVideoPlaying = false,
    updateChatDelay,
    updateTheme,
    badgeSettings,
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
                resetFunction={resetFunction}
            />

            <div ref={scrollContainerRef} className={`chat-sidebar-content ${hasMessages ? 'chat-mode' : ''} ${showScrollbar ? 'scrollbar-visible' : ''}`}>
                {hasMessages ? (
                    <Chat
                        chatMessages={messagesToRender}
                        bttvEmotes={vodState.currentVodBttvEmotes}
                        badgeMap={badgeMap}
                        selectedVod={vodState.selectedVod}
                        isVideoPlaying={isVideoPlaying}
                    />
                ) : (
                    <ChatSelector
                        vodSummaries={vodState.vodSummaries}
                        onSelectKnownJson={handleSelectKnownVod}
                        videoMetadata={videoMetadata}
                        searchFilter={searchFilter}
                    />
                )}
            </div>

            <Settings
                isOpen={isSettingsOpen}
                onClose={handleCloseSettings}
                updateChatDelay={updateChatDelay}
                updateTheme={updateTheme}
                updateBadgeSettings={updateBadgeSettings}
            />
        </div>
    )
}

export default ChatSidebar
