import './Video.css'
import YouTube, { YouTubeEvent } from 'react-youtube'
import { FC, useMemo } from 'react'
import { VideoSelector } from './VideoSelector'
import { VideoData } from '../types'

type PlayerVars = {
    autoplay: number,
    listType?: string,
    list?: string
}

type VideoProps = {
    videoData: VideoData | null,
    onSubmit: (data: VideoData) => void,
    onReady: (event: YouTubeEvent) => void,
    onPlaybackRateChange: (event: YouTubeEvent) => void,
    onPlay: (event: YouTubeEvent) => void,
    onPause: (event: YouTubeEvent) => void,
    onEnd?: () => void
}

export const Video: FC<VideoProps> = ({
    videoData,
    onSubmit,
    onReady,
    onPlaybackRateChange,
    onPlay,
    onPause,
    onEnd
}) => {
    const playerVars = useMemo<PlayerVars>(() => {
        if (!videoData) {
            return { autoplay: 1 }
        }

        const listType = videoData.playlistId ? 'playlist' : undefined

        return {
            autoplay: 1,
            listType: listType,
            list: videoData.playlistId
        }
    }, [videoData])

    return (
        <>
            {videoData ? (
                <YouTube
                    className='video'
                    opts={{ playerVars }}
                    videoId={videoData?.videoId}
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
                    onPlay={onPlay}
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
