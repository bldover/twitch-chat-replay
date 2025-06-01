import './App.css'
import { Video } from './Video'
import ChatSidebar from './ChatSidebar'
import { useEffect, useState, useCallback } from 'react'
import { getQueryParam, setQueryParam } from '../utils/queryParams'
import { YouTubeEvent, YouTubePlayer } from 'react-youtube'
import allBttvEmotes from '../data/bttv/emotes.json'
import { ChatMessage, BttvEmoteMap, AllBttvEmotes, VideoMetadata, VodSummary, ChatData, VideoData } from '../types'

function App() {
    const [videoData, setVideoData] = useState<VideoData | null>(null)
    const [vodSummaries, setVodSummaries] = useState<VodSummary[]>([])
    const [selectedVod, setSelectedVod] = useState<VodSummary | null>(null)
    const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null)
    const [searchFilter, setSearchFilter] = useState<string>('')
    const [messages, setMessages] = useState<ChatMessage[] | null>(null)
    const [messagesToRender, setMessagesToRender] = useState<ChatMessage[]>([])
    const [currentVodBttvEmotes, setCurrentVodBttvEmotes] = useState<BttvEmoteMap | null>(null)
    const [currentMessageIndex, setCurrentMessageIndex] = useState<number>(0)
    const [mediaStartTime, setMediaStartTime] = useState<Date>(new Date())
    const [chatEnabled, setChatEnabled] = useState<boolean>(false)
    const [dirtyChat, setDirtyChat] = useState<boolean>(false)
    const [playbackRate, setPlaybackRate] = useState<number>(1)
    const [lastPlayEventTime, setLastPlayEventTime] = useState<Date>(new Date())
    const [chatDelay, setChatDelay] = useState<number>(0)
    const [videoPlayer, setVideoPlayer] = useState<YouTubePlayer | null>(null)
    const [funnyMoments, setFunnyMoments] = useState<number[]>([])

    const selectVideo = useCallback((data: VideoData): void => {
        console.debug('selectVideo: ', data)
        if (data.videoId === videoData?.videoId && data.playlistId === videoData?.playlistId) {
            console.debug("skip select due to no change")
            return
        }
        setVideoData(data)
        if (data.videoId) {
            setQueryParam("youtubeId", data.videoId)
        }
        if (data.playlistId) {
            setQueryParam("playlistId", data.playlistId)
        }
    }, [videoData])

    const selectChat = (summary: VodSummary): void => {
        console.debug('selectChat: ' + summary)
        setSelectedVod(summary)
        setQueryParam("twitchId", summary.id)
        if (selectedVod?.id !== summary.id) {
            fetchChatData(summary.id)
        }
    }

    const findCommentIndexForOffset = useCallback((offset: number): number => {
        console.debug('findCommentIndexForOffset')
        if (!messages) return 0
        let left = 0
        let right = messages.length
        let middle = 0
        while (left !== right) {
            middle = left + Math.floor((right - left) / 2)
            const commentTime = messages[middle].content_offset_seconds
            if ((commentTime - offset) > 0) {
                right = middle
            } else if ((commentTime - offset) < 0) {
                left = middle + 1
            } else {
                return middle
            }
        }
        return left
    }, [messages])

    const updateChatMessages = (): void => {
        console.debug('updateChatMessages')
        if (!chatEnabled || !messages) {
            return
        }
        const currentTime = new Date()
        currentTime.setSeconds(currentTime.getSeconds() + (currentTime.getTime() - lastPlayEventTime.getTime()) * (playbackRate - 1) / 1000)
        let messagesToAdd: ChatMessage[] = []
        let i = currentMessageIndex
        while (i < messages.length && Math.ceil((currentTime.getTime() - mediaStartTime.getTime()) / 1000) >= (messages[i].content_offset_seconds + chatDelay)) {
            messagesToAdd = messagesToAdd.concat(messages[i])
            i += 1
        }
        setCurrentMessageIndex(i)

        const isDirty = dirtyChat
        const newChatMessages = isDirty ? messagesToAdd : messagesToRender.concat(messagesToAdd)
        const start = Math.max(newChatMessages.length - 100, 0)
        const end = newChatMessages.length
        setMessagesToRender(newChatMessages.slice(start, end))
        if (isDirty) {
            setDirtyChat(false)
        }
    }

    const syncChat = useCallback((): void => {
        console.debug('syncChat')
        if (!messages || !videoPlayer) {
            return
        }
        const currentTime = videoPlayer.getCurrentTime();
        setCurrentMessageIndex(Math.max(0, findCommentIndexForOffset(currentTime - chatDelay) - 100))
        const startTime = new Date()
        startTime.setSeconds(startTime.getSeconds() - currentTime)
        setMediaStartTime(startTime)
        setDirtyChat(true)
        setLastPlayEventTime(new Date())
    }, [messages, videoPlayer, chatDelay, findCommentIndexForOffset])

    const resetAll = (): void => {
        console.debug('resetAll')
        setVideoData(null);
        setMessages(null);
        setMessagesToRender([]);
        setCurrentVodBttvEmotes(null)
        setCurrentMessageIndex(0);
        setPlaybackRate(1);
        setChatDelay(0);
        setChatEnabled(false);
        setFunnyMoments([]);
        setVideoMetadata(null);
        setSearchFilter('');
        setSelectedVod(null);

        window.history.pushState('home', 'Twitch Chat Replay', '/')
    }

    const clearChat = (): void => {
        console.debug('clearChat')
        setMessages(null);
        setMessagesToRender([]);
        setCurrentVodBttvEmotes(null)
        setCurrentMessageIndex(0);
        setChatEnabled(false);
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

        setChatEnabled(true)
    }

    const onPause = (event: YouTubeEvent): void => {
        console.debug('onPause')
        setChatEnabled(false)
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

    const fetchVodSummaries = useCallback(() => {
        console.debug('fetchVodSummaries')
        fetch('/content/vod-summaries.json')
            .then((response) => {
                response.json().then(s => setVodSummaries(s))
                    .catch(reason => {
                        console.log('Converting summaries to json failed: ' + reason)
                    })
            }).catch(reason => {
                console.log('Fetching summaries failed: ' + reason)
            })
    }, [])

    const fetchChatData = (twitchId: string): void => {
        console.debug('fetchChatData')
        const fetchChatMessages = (twitchId: string): void => {
            const url = 'http://localhost:8083/clickityclack.co.uk/content/videos/' + twitchId + '.json'
            fetch(url)
                .then(response => {
                    response.json().then((m: ChatData) => {
                        const sortedMessages = m.comments.sort((a, b) => a.content_offset_seconds - b.content_offset_seconds)
                        setMessages(sortedMessages)
                        setCurrentVodBttvEmotes(sortedMessages[0] ? findCorrectBttvEmotesForVod(sortedMessages[0].created_at) : null)
                    }
                    ).catch(reason => {
                        console.log('Converting comments to json failed: ' + reason)
                    })
                }).catch(reason => {
                    console.log('Fetching comments failed: ' + reason)
                })
        }

        const fetchFunnyMomentJson = function (twitchId: string): void {
            const url = 'http://localhost:8083/clickityclack.co.uk/content/funny-moments/' + twitchId + '.json'
            fetch(url)
                .then(response => {
                    response.json().then((funnyMoments: number[]) => {
                        setFunnyMoments(funnyMoments.sort((a, b) => a - b))
                    }).catch(reason => {
                        console.log('Converting funny moments to json failed: ' + reason)
                    })
                }).catch(reason => {
                    console.log('Fetching funny moments failed: ' + reason)
                })
        }

        fetchChatMessages(twitchId)
        fetchFunnyMomentJson(twitchId)
    }

    useEffect(() => {
        if (messages) {
            const timer = setTimeout(updateChatMessages, 500)
            return () => clearTimeout(timer)
        }
    })

    useEffect(() => {
        if (vodSummaries.length === 0) {
            fetchVodSummaries()
        }
    }, [vodSummaries, fetchVodSummaries])

    useEffect(() => {
        syncChat()
    }, [messages, videoPlayer, playbackRate, chatEnabled, syncChat])

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
