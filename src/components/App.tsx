import './App.css'
import { Video } from './video/Video'
import ChatSidebar from './chat/ChatSidebar'
import { useVideoPlayer } from '../hooks/useVideoPlayer'
import { useVodData } from '../hooks/useVodData'
import { useChatPosition } from '../hooks/useChatPosition'
import { YouTubeEvent } from 'react-youtube'
import { useEffect } from 'react'
import { ResetProvider, useResetContext } from '../contexts/ResetContext'
import { SettingsProvider, useSettings } from '../contexts/SettingsContext'

function AppContent() {
    const { videoState, selectVideo, videoHandlers, setFunnyMoments } = useVideoPlayer()
    const { vodState: vodData, selectVod, onUploadCustomVod } = useVodData(setFunnyMoments)
    const chatPosition = useChatPosition()
    const { settings } = useSettings()
    const { triggerReset } = useResetContext()

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', settings.theme)
    }, [settings.theme])

    const resetAll = (): void => {
        console.debug('resetAll')
        triggerReset('full-reset');
        window.history.pushState('home', 'Twitch Chat Replay', '/')
    }

    const handleVideoChange = (event: YouTubeEvent) => {
        videoHandlers.onVideoChange(event);
        if (videoState.videoData?.currentVideoId) {
            triggerReset('video-change');
        }
    }

    // youtube player cursor interaction messes up the resizing so use an overlay to disable the interaction
    const showOverlay = chatPosition.isResizing;

    return (
        <div className={`App ${chatPosition.getLayoutClass()}`}>
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
            <div className='chat-container'>
                <ChatSidebar
                    vodState={vodData}
                    onReset={resetAll}
                    onSelectKnownVod={selectVod}
                    onUploadCustomVod={onUploadCustomVod}
                    videoMetadata={videoState.videoMetadata}
                    videoState={videoState}
                    chatPosition={chatPosition}
                />
            </div>
        </div>
    )
}

function App() {
    return (
        <SettingsProvider>
            <ResetProvider>
                <AppContent />
            </ResetProvider>
        </SettingsProvider>
    );
}

export default App
