import './Video.css'
import YouTube, { YouTubeEvent } from 'react-youtube'
import { FC, useCallback, useMemo } from 'react'
import { VideoSelector } from './VideoSelector'
import { VideoData } from '../types'

type PlayerVars = {
    autoplay: number,
    listType?: string,
    list?: string,
    index?: number
}

type VideoProps = {
    videoData: VideoData | null,
    onSubmit: (data: VideoData) => void,
    onReady: (event: YouTubeEvent) => void,
    onPlaybackRateChange: (event: YouTubeEvent) => void,
    onPlay: (event: YouTubeEvent) => void,
    onPause: (event: YouTubeEvent) => void,
    onVideoChange: (event: YouTubeEvent) => void,
    onEnd?: () => void
}

export const Video: FC<VideoProps> = ({
    videoData,
    onSubmit,
    onReady,
    onPlaybackRateChange,
    onPlay,
    onPause,
    onVideoChange,
    onEnd
}) => {

    const handlePlay = useCallback((event: YouTubeEvent) => {
        onPlay(event)
        if (videoData?.currentVideoId !== event.target.playerInfo?.videoData?.video_id) {
            onVideoChange(event)
        }
    }, [onVideoChange, onPlay, videoData?.currentVideoId])

    const playerVars = useMemo<PlayerVars>(() => {
        if (!videoData) {
            return { autoplay: 1 }
        }

        const listType = videoData.playlistId ? 'playlist' : undefined

        return {
            autoplay: 1,
            listType: listType,
            list: videoData.playlistId,
            index: videoData.initialVideoIndex
        }
    }, [videoData])

    return (
        <>
            {videoData ? (
                <YouTube
                    className='video'
                    opts={{ playerVars }}
                    videoId={videoData?.initialVideoId}
                    onReady={onReady}
                    onPlaybackRateChange={onPlaybackRateChange}
                    onStateChange={
                        (event) => {
                            if (event.data === YouTube.PlayerState.BUFFERING) {
                                onPause(event)
                            }
                        }
                    }
                    onEnd={onEnd}
                    onPlay={handlePlay}
                    onPause={onPause} />
            ) : (
                <>
                    <VideoSelector onSubmit={onSubmit} />
                    <a className='source-code-link' href='https://github.com/charlie-collard/twitch-chat-replay' target='_blank' rel='noreferrer'>
                        View source code on GitHub
                    </a>
                </>
            )}
        </>
    )
}
