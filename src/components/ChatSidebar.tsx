import './ChatSidebar.css'
import { FC, useState, useRef, useEffect } from 'react'
import Chat from './Chat'
import ChatSelector from './ChatSelector'
import Settings from './Settings'
import ChatHeader from './ChatHeader'
import { ChatMessage, BttvEmoteMap, VodSummary, VideoMetadata, ChatData } from '../types'

interface ChatSidebarProps {
    messages: ChatMessage[] | null
    messagesToRender: ChatMessage[]
    bttvEmotes: BttvEmoteMap | null
    resetFunction: () => void
    onSelectKnownVod: (summary: VodSummary) => void
    onUploadCustomVod: (json: ChatData) => void
    videoMetadata: VideoMetadata | null
    vodSummaries: VodSummary[]
    selectedVod?: VodSummary | null
    isVideoPlaying?: boolean
    updateChatDelay: (delay: number) => void
}

const ChatSidebar: FC<ChatSidebarProps> = ({
    messages,
    messagesToRender,
    bttvEmotes,
    resetFunction,
    onSelectKnownVod,
    onUploadCustomVod,
    videoMetadata,
    vodSummaries,
    selectedVod,
    isVideoPlaying = false,
    updateChatDelay
}) => {
    const [isHeaderMinimized, setIsHeaderMinimized] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [showScrollbar, setShowScrollbar] = useState(false)
    const [searchFilter, setSearchFilter] = useState<string>('')
    const hideScrollbarTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const scrollContainerRef = useRef<HTMLDivElement>(null)

    const hasMessages = messages !== null

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
                        bttvEmotes={bttvEmotes}
                        selectedVod={selectedVod}
                        isVideoPlaying={isVideoPlaying}
                    />
                ) : (
                    <ChatSelector
                        vodSummaries={vodSummaries}
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
            />
        </div>
    )
}

export default ChatSidebar
