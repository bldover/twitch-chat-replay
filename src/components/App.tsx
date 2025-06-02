import './App.css'
import { Video } from './Video'
import ChatSidebar from './ChatSidebar'
import { useChatSync } from '../hooks/useChatSync'
import { useVideoPlayer } from '../hooks/useVideoPlayer'
import { useVodData } from '../hooks/useVodData'

function App() {
    const { videoState, selectVideo, videoHandlers, setFunnyMoments, resetVideo } = useVideoPlayer()
    const { vodSummaries, selectedVod, messages, currentVodBttvEmotes, selectChat, onUploadCustomVod, resetVodData } =
        useVodData(videoState.playState)
    const { messagesToRender, chatEnabled, resetChat } = useChatSync(messages, videoState)

    const handleSelectChat = (summary: any) => selectChat(summary, setFunnyMoments)

    const resetAll = (): void => {
        console.debug('resetAll')
        resetChat();
        resetVideo();
        resetVodData();

        window.history.pushState('home', 'Twitch Chat Replay', '/')
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
                    onEnd={videoHandlers.onEnd}
                />
            </div>
            <div className='chat-container'>
                <ChatSidebar
                    messages={messages}
                    messagesToRender={messagesToRender}
                    bttvEmotes={currentVodBttvEmotes}
                    resetFunction={resetAll}
                    onSelectKnownVod={handleSelectChat}
                    onUploadCustomVod={onUploadCustomVod}
                    videoMetadata={videoState.videoMetadata}
                    vodSummaries={vodSummaries}
                    selectedVod={selectedVod}
                    isVideoPlaying={chatEnabled}
                />
            </div>
        </div>
    )
}

export default App
