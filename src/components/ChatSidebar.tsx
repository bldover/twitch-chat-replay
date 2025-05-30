import './ChatSidebar.css'
import { FC, useState, useRef } from 'react'
import Chat from './Chat'
import ChatSelector from './ChatSelector'
import { ChatMessage, BttvEmoteMap, VodSummary, VideoMetadata, ChatData } from '../types'
import { SettingsIcon, UploadIcon, CloseIcon, ArrowDownIcon, ArrowUpIcon } from './Icons'

interface ChatSidebarProps {
    messages: ChatMessage[] | null
    messagesToRender: ChatMessage[]
    bttvEmotes: BttvEmoteMap | null
    resetFunction: () => void
    onSelectKnownVod: (summary: VodSummary) => void
    onUploadCustomVod: (json: ChatData) => void
    videoMetadata: VideoMetadata | null
    searchFilter?: string
    onSearchFilterChange?: (filter: string) => void
}

interface SettingsModalProps {
    isOpen: boolean
    onClose: () => void
}

const SettingsModal: FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null

    return (
        <div className="settings-modal-overlay" onClick={onClose}>
            <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
                <div className="settings-modal-header">
                    <h3>Settings</h3>
                    <button className="settings-modal-close" onClick={onClose}>{CloseIcon({})}</button>
                </div>
                <div className="settings-modal-content">
                    {/* Settings content will go here */}
                    <p>Settings coming soon...</p>
                </div>
            </div>
        </div>
    )
}

const ChatSidebar: FC<ChatSidebarProps> = ({
    messages,
    messagesToRender,
    bttvEmotes,
    resetFunction,
    onSelectKnownVod,
    onUploadCustomVod,
    videoMetadata,
    searchFilter = '',
    onSearchFilterChange
}) => {
    const [isHeaderMinimized, setIsHeaderMinimized] = useState(false)
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [showScrollbar, setShowScrollbar] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const hideScrollbarTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const hasMessages = messages !== null
    const showHeader = !hasMessages || !isHeaderMinimized

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

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (onSearchFilterChange) {
            onSearchFilterChange(event.target.value)
        }
    }

    const handleSearchClick = (event: React.MouseEvent<HTMLInputElement>) => {
        const target = event.target as HTMLInputElement
        if (target.value === 'Search for NL vods here!') {
            target.value = ''
        }
    }

    const handleUploadClick = () => {
        fileInputRef.current?.click()
    }

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        new Promise<string>((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = (error) => reject(error)
            reader.readAsText(file)
        })
            .then((result) => onUploadCustomVod(JSON.parse(result)))
            .catch((error) => console.log(error))
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

    return (
        <div
            className='chat-sidebar'
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {showHeader && (
                <div className="chat-sidebar-header">
                    <div className="header-left">
                        {!hasMessages && (
                            <>
                                <input
                                    className="header-search"
                                    placeholder="Search for NL vods here!"
                                    value={searchFilter}
                                    onChange={handleSearchChange}
                                    onClick={handleSearchClick}
                                />
                                <button
                                    className="header-btn"
                                    onClick={handleUploadClick}
                                    title="Upload chat file"
                                >
                                    {UploadIcon({})}
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".json"
                                    style={{ display: 'none' }}
                                    onChange={handleFileUpload}
                                />
                            </>
                        )}
                    </div>
                    <div className="header-right">
                        <button className="header-btn" onClick={handleSettingsClick} title="Settings">
                            {SettingsIcon({})}
                        </button>
                        {hasMessages && (
                            <button className="header-btn" onClick={handleMinimizeHeader} title="Minimize header">
                                {ArrowUpIcon({})}
                            </button>
                        )}
                        <button className="header-btn header-btn-close" onClick={resetFunction} title="Close">
                            {CloseIcon({})}
                        </button>
                    </div>
                </div>
            )}

            {hasMessages && isHeaderMinimized && (
                <button className="header-btn expand-header-btn" onClick={handleExpandHeader} title="Show header">
                    {ArrowDownIcon({})}
                </button>
            )}

            <div className={`chat-sidebar-content ${showScrollbar ? 'scrollbar-visible' : ''}`}>
                {hasMessages ? (
                    <Chat
                        chatMessages={messagesToRender}
                        bttvEmotes={bttvEmotes}
                    />
                ) : (
                    <ChatSelector
                        onSelectKnownJson={onSelectKnownVod}
                        onUploadCustomJson={onUploadCustomVod}
                        videoMetadata={videoMetadata}
                        searchFilter={searchFilter}
                    />
                )}
            </div>

            <SettingsModal
                isOpen={isSettingsOpen}
                onClose={handleCloseSettings}
            />
        </div>
    )
}

export default ChatSidebar
