import './App.css'
import { Video } from './Video'
import ChatSidebar from './ChatSidebar'
import { useCallback, useEffect, useState } from 'react'
import { getQueryParam, setQueryParam } from '../utils/queryParams'
import YouTube, { YouTubeEvent } from 'react-youtube'
import allBttvEmotes from '../data/bttv/emotes.json'
import { ChatMessage, BttvEmoteMap, AllBttvEmotes, VideoMetadata, VodSummary, ChatData } from '../types'

function App() {
    const [messages, setMessages] = useState<ChatMessage[] | null>(null)
    const [videoId, setVideoId] = useState<string | null>(null)
    const [messagesToRender, setMessagesToRender] = useState<ChatMessage[]>([])
    const [currentVodBttvEmotes, setCurrentVodBttvEmotes] = useState<BttvEmoteMap | null>(null)
    const [currentMessageIndex, setCurrentMessageIndex] = useState<number>(0)
    const [mediaStartTime, setMediaStartTime] = useState<Date>(new Date())
    const [chatEnabled, setChatEnabled] = useState<boolean>(false)
    const [dirtyChat, setDirtyChat] = useState<boolean>(false)
    const [playbackRate, setPlaybackRate] = useState<number>(1)
    const [lastPlayEventTime, setLastPlayEventTime] = useState<Date>(new Date())
    const [chatDelay, setChatDelay] = useState<number>(0)
    const [videoPlayer, setVideoPlayer] = useState<any>(null)
    const [funnyMoments, setFunnyMoments] = useState<number[]>([])
    const [videoMetadata, setVideoMetadata] = useState<VideoMetadata | null>(null)
    const [searchFilter, setSearchFilter] = useState<string>('')

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

    const resetChat = useCallback((): void => {
        console.debug('resetChat')
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
        setVideoId(null);
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

        let basePath = '/'
        if (getQueryParam('chatAutoSelect') != null) {
            basePath += '?chatAutoSelect=' + getQueryParam('chatAutoSelect')
        }
        window.history.pushState('home', 'Twitch Chat Replay', basePath)
    }

    const onReady = (event: YouTubeEvent): void => {
        console.debug('onReady')
        setVideoPlayer(event.target)

        if (getQueryParam('chatAutoSelect') === 'true') {
            fetchVideoMetadata(event.target)
        }
    }

    const onPlay = (event: YouTubeEvent): void => {
        console.debug('onPlay')
        setChatEnabled(true)
        resetChat()
    }

    const onPause = (event: YouTubeEvent): void => {
        console.debug('onPause')
        setChatEnabled(false)
    }

    const onStateChange = (event: YouTubeEvent): void => {
        console.debug('onStateChange')
        if (event.data === YouTube.PlayerState.BUFFERING
            || event.data === YouTube.PlayerState.PAUSED
        ) {
            onPause(event)
        }
        if (event.data === YouTube.PlayerState.PLAYING) {
            onPlay(event)
        }
    }

    const onPlaybackRateChange = (event: YouTubeEvent): void => {
        console.debug('onPlaybackRateChange')
        setPlaybackRate(event.data)
        resetChat()
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

    const onSelectKnownVod = (summary: VodSummary): void => {
        console.debug('onSelectKnownVod')
        setQueryParam('twitchId', summary.id)
        fetchDataForVideo(summary.id)
    }

    const onUploadCustomVod = (json: ChatData): void => {
        console.debug('onUploadCustomVod')
        const sortedMessages = json.comments.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        setMessages(sortedMessages)
        setCurrentVodBttvEmotes(sortedMessages[0] ? findCorrectBttvEmotesForVod(sortedMessages[0].created_at) : null)
    }

    const onSelectVideo = (youtubeId: string): void => {
        console.debug('onSelectVideo')
        setVideoId(youtubeId)
    }

    const fetchVideoMetadata = async (player: any): Promise<void> => {
        console.debug('fetchVideoMetadata')
        if (player) {
            setVideoMetadata({
                title: player.videoTitle,
                duration: player.getDuration(),
            })
        }
    }

    const fetchDataForVideo = useCallback((twitchId: string): void => {
        console.debug('fetchDataForVideo')
        const fetchVideoJson = (twitchId: string): void => {
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

        fetchVideoJson(twitchId)
        fetchFunnyMomentJson(twitchId)
    }, [])

    useEffect(() => {
        if (messages) {
            const timer = setTimeout(updateChatMessages, 500)
            return () => clearTimeout(timer)
        }
    })

    useEffect(() => {
        const twitchId = getQueryParam('twitchId')
        if (!messages && twitchId) {
            fetchDataForVideo(twitchId)
        }
    }, [fetchDataForVideo, messages])

    useEffect(() => {
        const youtubeId = getQueryParam('youtubeId')
        if (!videoId && youtubeId) {
            setVideoId(youtubeId)
        }
    }, [videoId])

    useEffect(() => {
        const delay = getQueryParam('delay')
        if (!chatDelay && delay) {
            setChatDelay(parseFloat(delay))
        }
    }, [chatDelay])

    useEffect(() => {
        if (messages && videoPlayer) {
            resetChat()
        }
    }, [messages, videoPlayer, resetChat])

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
                    videoId={videoId}
                    onSelectVideo={onSelectVideo}
                    onReady={onReady}
                    onPlaybackRateChange={onPlaybackRateChange}
                    onStateChange={onStateChange}
                />
            </div>
            <div className='chat-container'>
                <ChatSidebar
                    messages={messages}
                    messagesToRender={messagesToRender}
                    bttvEmotes={currentVodBttvEmotes}
                    resetFunction={resetAll}
                    onSelectKnownVod={onSelectKnownVod}
                    onUploadCustomVod={onUploadCustomVod}
                    videoMetadata={videoMetadata}
                    searchFilter={searchFilter}
                    onSearchFilterChange={setSearchFilter}
                />
            </div>
        </div>
    )
}

export default App
