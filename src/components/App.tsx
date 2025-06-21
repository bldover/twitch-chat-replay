import './App.css'
import { Video } from './video/Video'
import ChatSidebar from './chat/ChatSidebar'
import { useChatSync } from '../hooks/useChatSync'
import { useVideoPlayer } from '../hooks/useVideoPlayer'
import { useVodData } from '../hooks/useVodData'
import { useBadges } from '../hooks/useBadges'
import { YouTubeEvent } from 'react-youtube'
import { useState, useEffect } from 'react'
import { getTheme, getChatPosition } from '../utils/settings'
import { Theme, ChatPosition } from '../types'

function App() {
    const { videoState, selectVideo, videoHandlers, setFunnyMoments, resetVideo } = useVideoPlayer()
    const { state: vodState, selectChat, onUploadCustomVod, resetSelectedChat } = useVodData(setFunnyMoments)
    const { messagesToRender, chatEnabled, resetChat, updateChatDelay } = useChatSync(vodState.messages, videoState)
    const { badgeMap, updateBadgeSettings } = useBadges(vodState.broadcaster)
    const [currentTheme, setCurrentTheme] = useState<Theme>(getTheme())
    const [currentChatPosition, setCurrentChatPosition] = useState<ChatPosition>(getChatPosition())

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', currentTheme)
    }, [currentTheme])


    const handleThemeUpdate = (theme: Theme) => {
        setCurrentTheme(theme)
    }

    const handleChatPositionUpdate = (position: ChatPosition) => {
        setCurrentChatPosition(position)
    }

    const handleSelectChat = (summary: any) => selectChat(summary)

    const resetAll = (): void => {
        console.debug('resetAll')
        resetChat();
        resetVideo();
        resetSelectedChat();

        window.history.pushState('home', 'Twitch Chat Replay', '/')
    }

    const handleVideoChange = (event: YouTubeEvent) => {
        videoHandlers.onVideoChange(event);
        if (videoState.videoData?.currentVideoId) {
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
                updateTheme={handleThemeUpdate}
                updateChatPosition={handleChatPositionUpdate}
                updateBadgeSettings={updateBadgeSettings}
                badgeMap={badgeMap}
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
