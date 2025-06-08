import './App.css'
import { Video } from './video/Video'
import ChatSidebar from './chat/ChatSidebar'
import { useChatSync } from '../hooks/useChatSync'
import { useVideoPlayer } from '../hooks/useVideoPlayer'
import { useVodData } from '../hooks/useVodData'
import { YouTubeEvent } from 'react-youtube'
import { useState, useEffect } from 'react'
import { getTheme } from '../utils/settings'
import { Theme } from '../types'

function App() {
    const { videoState, selectVideo, videoHandlers, setFunnyMoments, resetVideo } = useVideoPlayer()
    const { state: vodState, selectChat, onUploadCustomVod, resetSelectedChat } = useVodData(setFunnyMoments)
    const { messagesToRender, chatEnabled, resetChat, updateChatDelay } = useChatSync(vodState.messages, videoState)
    const [currentTheme, setCurrentTheme] = useState<Theme>(getTheme())

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', currentTheme)
    }, [currentTheme])

    const handleThemeUpdate = (theme: Theme) => {
        setCurrentTheme(theme)
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

    return (
        <div className='App'>
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
            <div className='chat-container'>
                <ChatSidebar
                    vodState={vodState}
                    messagesToRender={messagesToRender}
                    resetFunction={resetAll}
                    onSelectKnownVod={handleSelectChat}
                    onUploadCustomVod={onUploadCustomVod}
                    videoMetadata={videoState.videoMetadata}
                    isVideoPlaying={chatEnabled}
                    updateChatDelay={updateChatDelay}
                    updateTheme={handleThemeUpdate}
                />
            </div>
        </div>
    )
}

export default App
