import './App.css'
import { Video } from './Video'
import ChatSidebar from './ChatSidebar'
import { useEffect, useState, useCallback } from 'react'
import { getQueryParam, setQueryParam } from '../utils/queryParams'
import { YouTubeEvent, YouTubePlayer } from 'react-youtube'
import allBttvEmotes from '../data/bttv/emotes.json'
import { ChatMessage, BttvEmoteMap, AllBttvEmotes, VideoMetadata, VodSummary, ChatData, VideoData } from '../types'
import { fetchVodSummaries } from '../api/vodApi'
import { fetchChatMessages } from '../api/chatApi'
import { fetchFunnyMoments } from '../api/contentApi'
import { useChatSync } from '../hooks/useChatSync'

function App() {
    const [videoData, setVideoData] = useState<VideoData | null>(null)
    const [vodSummaries, setVodSummaries] = useState<VodSummary[]>([])
    const [selectedVod, setSelectedVod] = useState<VodSummary | null>(null)
    const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null)
    const [searchFilter, setSearchFilter] = useState<string>('')
    const [messages, setMessages] = useState<ChatMessage[] | null>(null)
    const [currentVodBttvEmotes, setCurrentVodBttvEmotes] = useState<BttvEmoteMap | null>(null)
    const [chatDelay, setChatDelay] = useState<number>(0)
    const [videoPlayer, setVideoPlayer] = useState<YouTubePlayer | null>(null)
    const [funnyMoments, setFunnyMoments] = useState<number[]>([])

    const { messagesToRender, isEnabled: chatEnabled, enableChat, disableChat, syncToVideo, setPlaybackRate, resetChat } = useChatSync(
        messages,
        videoPlayer,
        chatDelay
    )

    const selectVideo = useCallback((data: VideoData): void => {
        console.debug('selectVideo: ', data)
        setVideoData(data)
        if (data.videoId) {
            setQueryParam("youtubeId", data.videoId)
        }
        if (data.playlistId) {
            setQueryParam("playlistId", data.playlistId)
        }
    }, [])

    const selectChat = async (summary: VodSummary): Promise<void> => {
        console.debug('selectChat: ' + summary)
        setSelectedVod(summary)
        setQueryParam("twitchId", summary.id)
        if (selectedVod?.id !== summary.id) {
            await loadChatData(summary.id)
        }
    }


    const resetAll = (): void => {
        console.debug('resetAll')
        setVideoData(null);
        setMessages(null);
        setCurrentVodBttvEmotes(null)
        setChatDelay(0);
        setFunnyMoments([]);
        setVideoMetadata(null);
        setSearchFilter('');
        setSelectedVod(null);
        resetChat();

        window.history.pushState('home', 'Twitch Chat Replay', '/')
    }

    const clearChat = (): void => {
        console.debug('clearChat')
        setMessages(null);
        setCurrentVodBttvEmotes(null)
        resetChat();
    }

    const onReady = (event: YouTubeEvent): void => {
        console.debug('onReady')
        const player = event.target
        setVideoPlayer(player)
        setVideoMetadata({
            title: player.playerInfo.videoData.title,
            duration: player.getDuration()
        })
    }

    const onVideoChange = (event: YouTubeEvent): void => {
        console.debug('onVideoChange')

        const player = event.target
        const newVideoId = player.playerInfo?.videoData?.video_id
        setQueryParam("youtubeId", newVideoId)

        clearChat()
        setVideoMetadata({
            title: player.playerInfo.videoData.title,
            duration: player.getDuration()
        })
    }

    const onPlay = (event: YouTubeEvent): void => {
        console.debug('onPlay')
        if (event.target.videoTitle !== videoMetadata?.title) {
            onVideoChange(event)
        }

        enableChat()
    }

    const onPause = (event: YouTubeEvent): void => {
        console.debug('onPause')
        disableChat()
    }

    const onEnd = (): void => {
        console.debug('onEnd')
        clearChat()
    }

    const onPlaybackRateChange = (event: YouTubeEvent): void => {
        console.debug('onPlaybackRateChange')
        setPlaybackRate(event.data)
    }

    const findCorrectBttvEmotesForVod = (created_at: string): BttvEmoteMap => {
        console.debug('findCorrectBttvEmotesForVod')
        const bttvDate = Object.keys(allBttvEmotes).sort()
            // Dates before or on the vod creation date
            .filter((bttvDate) => bttvDate < created_at)
            // The biggest date
            .reduce((date1, date2) => date1 > date2 ? date1 : date2, '0');

        const { global, northernlion: { sharedEmotes } } = (allBttvEmotes as AllBttvEmotes)[bttvDate]

        const allEmotes = global.concat(sharedEmotes)
        const resultMap: BttvEmoteMap = {}
        allEmotes.forEach((emote) => {
            resultMap[emote.code] = emote.id
        })
        // For old vods, where LUL was a BTTV emote.
        resultMap['LUL'] = resultMap['LuL']
        return resultMap
    }

    const onUploadCustomVod = (json: ChatData): void => {
        console.debug('onUploadCustomVod')
        const sortedMessages = json.comments.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        setMessages(sortedMessages)
        setCurrentVodBttvEmotes(sortedMessages[0] ? findCorrectBttvEmotesForVod(sortedMessages[0].created_at) : null)
    }

    const loadVodSummaries = useCallback(async (): Promise<void> => {
        console.debug('loadVodSummaries')
        try {
            const summaries = await fetchVodSummaries()
            setVodSummaries(summaries)
        } catch (error) {
            console.log('Loading vod summaries failed: ' + error)
        }
    }, [])

    const loadChatData = async (twitchId: string): Promise<void> => {
        console.debug('loadChatData')
        try {
            const [messages, funnyMoments] = await Promise.all([
                fetchChatMessages(twitchId),
                fetchFunnyMoments(twitchId)
            ])

            setMessages(messages)
            setCurrentVodBttvEmotes(messages[0] ? findCorrectBttvEmotesForVod(messages[0].created_at) : null)
            setFunnyMoments(funnyMoments)
        } catch (error) {
            console.log('Loading chat data failed: ' + error)
        }
    }

    useEffect(() => {
        if (vodSummaries.length === 0) {
            loadVodSummaries()
        }
    }, [vodSummaries, loadVodSummaries])

    const twitchId = getQueryParam('twitchId')
    if (selectedVod?.id !== twitchId) {

    }

    const youtubeId = getQueryParam('youtubeId')
    const playlistId = getQueryParam('playlistId')
    useEffect(() => {
        if (!videoData && youtubeId) {
            console.debug(`queryParams change new: youtubeId=${youtubeId}, playlistId=${playlistId}`)
            selectVideo({
                videoId: youtubeId || undefined,
                playlistId: playlistId || undefined
            })
        }
    }, [youtubeId, playlistId, videoData, selectVideo])

    const delay = parseFloat(getQueryParam('delay') || '0');
    if (chatDelay !== delay) {
        console.debug("delay not match")
        setChatDelay(delay)
    }

    useEffect(() => {
        const seekToFunnyMoment = (direction: string): void => {
            if (!videoPlayer || !funnyMoments) {
                return
            }
            const currentTime = videoPlayer.getCurrentTime()
            const validMoments = funnyMoments.filter((timestamp) =>
                direction === 'n' ? timestamp > currentTime : timestamp < currentTime - 5
            )
            if (validMoments.length > 0) {
                const index = direction === 'n' ? 0 : validMoments.length - 1
                videoPlayer.seekTo(validMoments[index], true)
            }
        }

        const listenerFunction = ({ key, repeat }: KeyboardEvent): void => {
            if (!repeat && (key === 'n' || key === 'p')) {
                seekToFunnyMoment(key)
            }
        }
        window.addEventListener('keydown', listenerFunction)
        return () => window.removeEventListener('keydown', listenerFunction)
    }, [videoPlayer, funnyMoments])


    return (
        <div className='App'>
            <div className='player-container'>
                <Video
                    videoData={videoData}
                    onSubmit={selectVideo}
                    onReady={onReady}
                    onPlaybackRateChange={onPlaybackRateChange}
                    onPlay={onPlay}
                    onPause={onPause}
                    onEnd={onEnd}
                />
            </div>
            <div className='chat-container'>
                <ChatSidebar
                    messages={messages}
                    messagesToRender={messagesToRender}
                    bttvEmotes={currentVodBttvEmotes}
                    resetFunction={resetAll}
                    onSelectKnownVod={selectChat}
                    onUploadCustomVod={onUploadCustomVod}
                    videoMetadata={videoMetadata}
                    searchFilter={searchFilter}
                    onSearchFilterChange={setSearchFilter}
                    vodSummaries={vodSummaries}
                    selectedVod={selectedVod}
                    isVideoPlaying={chatEnabled}
                />
            </div>
        </div>
    )
}

export default App
