import './App.css'
import { Video } from './video/Video'
import ChatSidebar from './chat/ChatSidebar'
import { useChatSync } from '../hooks/useChatSync'
import { useVideoPlayer } from '../hooks/useVideoPlayer'
import { useVodData } from '../hooks/useVodData'
import { useBadges } from '../hooks/useBadges'
import { useVodSelector } from '../hooks/useVodSelector'
import { useChatPosition } from '../hooks/useChatPosition'
import { YouTubeEvent } from 'react-youtube'
import { useState, useEffect } from 'react'
import { getTheme } from '../utils/settings'
import { Theme } from '../types'

function App() {
    const { videoState, selectVideo, videoHandlers, setFunnyMoments, resetVideo } = useVideoPlayer()
    const { vodState: vodData, selectVod, onUploadCustomVod, resetSelectedChat } = useVodData(setFunnyMoments)
    const { messagesToRender, chatEnabled, resetChat, updateChatDelay } = useChatSync(vodData.messages, videoState)
    const { badgeMap, updateBadgeSettings } = useBadges(vodData.broadcaster)
    const chatPosition = useChatPosition()
    const [currentTheme, setCurrentTheme] = useState<Theme>(getTheme())
    const [searchFilter, setSearchFilter] = useState<string>('')

    const hasMessages = vodData.messages !== null

    const vodSelector = useVodSelector({
        vodSummaries: vodData.vodSummaries,
        selectedVod: vodData.selectedVod,
        hasMessages,
        isVideoPlaying: videoState.playState === 'playing',
        videoMetadata: videoState.videoMetadata,
        searchFilter,
        onSelectVod: selectVod
    })

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', currentTheme)
    }, [currentTheme])

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

    // youtube player cursor interaction messes up the resizing so use an overlay to disable the interaction
    const showOverlay = chatPosition.isResizing;

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
            {showOverlay && <div className='video-overlay' />}
        </div>
    )

    const chatComponent = (
        <div className='chat-container'>
            <ChatSidebar
                vodState={vodData}
                messagesToRender={messagesToRender}
                onReset={resetAll}
                onSelectKnownVod={handleSelectChat}
                onUploadCustomVod={onUploadCustomVod}
                videoMetadata={videoState.videoMetadata}
                isVideoPlaying={chatEnabled}
                updateChatDelay={updateChatDelay}
                updateTheme={setCurrentTheme}
                updateBadgeSettings={updateBadgeSettings}
                badgeMap={badgeMap}
                searchFilter={searchFilter}
                onSearchFilterChange={setSearchFilter}
                vodSelector={vodSelector}
                chatPosition={chatPosition}
            />
        </div>
    )

    return (
        <div className={`App ${chatPosition.getLayoutClass()}`}>
            {videoComponent}
            {chatComponent}
        </div>
    )
}

export default App
