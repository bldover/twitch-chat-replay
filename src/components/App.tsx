import './App.css'
import { Video } from './video/Video'
import VideoOverlay from './video/VideoOverlay'
import ChatSidebar from './chat/ChatSidebar'
import { useChatSync } from '../hooks/useChatSync'
import { useVideoPlayer } from '../hooks/useVideoPlayer'
import { useVodData } from '../hooks/useVodData'
import { useBadges } from '../hooks/useBadges'
import { useVodSelector } from '../hooks/useVodSelector'
import { YouTubeEvent } from 'react-youtube'
import { useState, useEffect } from 'react'
import { getTheme, getChatPosition, getChatWidth, getChatHeight } from '../utils/settings'
import { Theme, ChatPosition } from '../types'

function App() {
    const { videoState, selectVideo, videoHandlers, setFunnyMoments, resetVideo } = useVideoPlayer()
    const { vodState, selectVod, onUploadCustomVod, resetSelectedChat } = useVodData(setFunnyMoments)
    const { messagesToRender, chatEnabled, resetChat, updateChatDelay } = useChatSync(vodState.messages, videoState)
    const { badgeMap, updateBadgeSettings } = useBadges(vodState.broadcaster)
    const [currentTheme, setCurrentTheme] = useState<Theme>(getTheme())
    const [currentChatPosition, setCurrentChatPosition] = useState<ChatPosition>(getChatPosition())
    const [currentChatWidth, setCurrentChatWidth] = useState<number>(getChatWidth())
    const [currentChatHeight, setCurrentChatHeight] = useState<number>(getChatHeight())
    const [isResizing, setIsResizing] = useState<boolean>(false)
    const [searchFilter, setSearchFilter] = useState<string>('')

    const hasMessages = vodState.messages !== null

    const vodSelector = useVodSelector({
        vodSummaries: vodState.vodSummaries,
        selectedVod: vodState.selectedVod,
        hasMessages,
        isVideoPlaying: videoState.playState === 'playing',
        videoMetadata: videoState.videoMetadata,
        searchFilter,
        onSelectVod: selectVod
    })

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', currentTheme)
    }, [currentTheme])

    useEffect(() => {
        document.documentElement.style.setProperty('--chat-width', `${currentChatWidth}px`)
        document.documentElement.style.setProperty('--chat-height', `${currentChatHeight}px`)
    }, [currentChatWidth, currentChatHeight])

    const handleResizeStart = () => setIsResizing(true);
    const handleResizeEnd = () => setIsResizing(false);

    const handleSelectChat = (summary: any) => selectVod(summary);

    const resetAll = (): void => {
        console.debug('resetAll')
        resetChat();
        resetVideo();
        setSearchFilter('');
        vodSelector.resetVodSelector();
        resetSelectedChat();

        window.history.pushState('home', 'Twitch Chat Replay', '/')
    }

    const handleVideoChange = (event: YouTubeEvent) => {
        videoHandlers.onVideoChange(event);
        if (videoState.videoData?.currentVideoId) {
            vodSelector.unselectVod();
            resetSelectedChat();
        }
    }

    const videoComponent = (
        <div className='player-container'>
            <Video
                videoData={videoState.videoData}
                onSubmit={selectVideo}
                onReady={videoHandlers.onReady}
                onPlaybackRateChange={videoHandlers.onPlaybackRateChange}
                onPlay={videoHandlers.onPlay}
                onPause={videoHandlers.onPause}
                onVideoChange={handleVideoChange}
                onEnd={videoHandlers.onEnd}
            />
            <VideoOverlay isVisible={isResizing} />
        </div>
    )

    const chatComponent = (
        <div className='chat-container'>
            <ChatSidebar
                vodState={vodState}
                messagesToRender={messagesToRender}
                onReset={resetAll}
                onSelectKnownVod={handleSelectChat}
                onUploadCustomVod={onUploadCustomVod}
                videoMetadata={videoState.videoMetadata}
                isVideoPlaying={chatEnabled}
                updateChatDelay={updateChatDelay}
                updateTheme={setCurrentTheme}
                updateChatPosition={setCurrentChatPosition}
                updateChatWidth={setCurrentChatWidth}
                updateChatHeight={setCurrentChatHeight}
                updateBadgeSettings={updateBadgeSettings}
                badgeMap={badgeMap}
                currentChatPosition={currentChatPosition}
                currentChatWidth={currentChatWidth}
                currentChatHeight={currentChatHeight}
                onResizeStart={handleResizeStart}
                onResizeEnd={handleResizeEnd}
                searchFilter={searchFilter}
                onSearchFilterChange={setSearchFilter}
                vodSelector={vodSelector}
            />
        </div>
    )

    const getLayoutClass = () => {
        switch (currentChatPosition) {
            case 'right':
                return 'layout-row'
            case 'left':
                return 'layout-row-reverse'
            case 'top':
                return 'layout-column-reverse'
            case 'bottom':
                return 'layout-column'
            default:
                return 'layout-row'
        }
    }

    return (
        <div className={`App ${getLayoutClass()}`}>
            {videoComponent}
            {chatComponent}
        </div>
    )
}

export default App
