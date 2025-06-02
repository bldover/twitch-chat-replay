import { useState, useCallback, useEffect } from 'react';
import { YouTubeEvent, YouTubePlayer } from 'react-youtube';
import { VideoData, VideoMetadata, VideoPlayState } from '../types';
import { setQueryParam, getQueryParam } from '../utils/queryParams';

export interface VideoPlayerState {
    videoData: VideoData | null;
    videoMetadata: VideoMetadata | null;
    videoPlayer: YouTubePlayer | null;
    funnyMoments: number[];
    playState: VideoPlayState;
    playbackRate: number;
}

interface VideoPlayerControls {
    videoState: VideoPlayerState;
    selectVideo: (data: VideoData) => void;
    videoHandlers: {
        onReady: (event: YouTubeEvent) => void;
        onPlay: (event: YouTubeEvent) => void;
        onPause: (event: YouTubeEvent) => void;
        onEnd: () => void;
        onPlaybackRateChange: (event: YouTubeEvent) => void;
    };
    setFunnyMoments: (moments: number[]) => void;
    resetVideo: () => void;
}

export const useVideoPlayer = (): VideoPlayerControls => {

    const [state, setState] = useState<VideoPlayerState>({
        videoData: null,
        videoMetadata: null,
        videoPlayer: null,
        funnyMoments: [],
        playState: 'idle',
        playbackRate: 1
    });

    const selectVideo = useCallback((data: VideoData): void => {
        console.debug('selectVideo: ', data);
        setState(prev => ({ ...prev, videoData: data }));
        if (data.videoId) {
            setQueryParam('youtubeId', data.videoId);
        }
        if (data.playlistId) {
            setQueryParam('playlistId', data.playlistId);
        }
    }, []);

    const onReady = useCallback((event: YouTubeEvent): void => {
        console.debug('onReady');
        const player = event.target;
        setState(prev => ({
            ...prev,
            videoPlayer: player,
            videoMetadata: {
                title: player.playerInfo.videoData.title,
                duration: player.getDuration()
            }
        }));
    }, []);

    const onVideoChange = useCallback((event: YouTubeEvent): void => {
        console.debug('onVideoChange');
        const player = event.target;
        const newVideoId = player.playerInfo?.videoData?.video_id;
        setQueryParam('youtubeId', newVideoId);

        setState(prev => ({
            ...prev,
            videoMetadata: {
                title: player.playerInfo.videoData.title,
                duration: player.getDuration()
            },
            playState: 'changed'
        }));
    }, []);

    const onPlay = useCallback((event: YouTubeEvent): void => {
        console.debug('onPlay');
        if (event.target.videoTitle !== state.videoMetadata?.title) {
            onVideoChange(event);
        } else {
            setState(prev => ({ ...prev, playState: 'playing' }));
        }
    }, [state.videoMetadata?.title, onVideoChange]);

    const onPause = useCallback((event: YouTubeEvent): void => {
        console.debug('onPause');
        setState(prev => ({ ...prev, playState: 'paused' }));
    }, []);

    const onEnd = useCallback((): void => {
        console.debug('onEnd');
        setState(prev => ({ ...prev, playState: 'ended' }));
    }, []);

    const onPlaybackRateChange = useCallback((event: YouTubeEvent): void => {
        console.debug('onPlaybackRateChange');
        setState(prev => ({ ...prev, playbackRate: event.data }));
    }, []);

    const setFunnyMoments = useCallback((moments: number[]): void => {
        setState(prev => ({ ...prev, funnyMoments: moments }));
    }, []);

    const resetVideo = useCallback((): void => {
        setState({
            videoData: null,
            videoMetadata: null,
            videoPlayer: null,
            funnyMoments: [],
            playState: 'idle',
            playbackRate: 1
        });
    }, []);

    useEffect(() => {
        const seekToFunnyMoment = (direction: string): void => {
            if (!state.videoPlayer || !state.funnyMoments.length) {
                return;
            }
            const currentTime = state.videoPlayer.getCurrentTime();
            const validMoments = state.funnyMoments.filter((timestamp) =>
                direction === 'n' ? timestamp > currentTime : timestamp < currentTime - 5
            );
            if (validMoments.length > 0) {
                const index = direction === 'n' ? 0 : validMoments.length - 1;
                state.videoPlayer.seekTo(validMoments[index], true);
            }
        };

        const listenerFunction = ({ key, repeat }: KeyboardEvent): void => {
            if (!repeat && (key === 'n' || key === 'p')) {
                seekToFunnyMoment(key);
            }
        };

        window.addEventListener('keydown', listenerFunction);
        return () => window.removeEventListener('keydown', listenerFunction);
    }, [state.videoPlayer, state.funnyMoments]);

    useEffect(() => {
        const youtubeId = getQueryParam('youtubeId');
        const playlistId = getQueryParam('playlistId');
        if (!state.videoData && youtubeId) {
            console.debug(`queryParams change new: youtubeId=${youtubeId}, playlistId=${playlistId}`);
            selectVideo({
                videoId: youtubeId || undefined,
                playlistId: playlistId || undefined
            });
        }
    }, [state.videoData, selectVideo]);

    return {
        videoState: state,
        selectVideo,
        videoHandlers: {
            onReady,
            onPlay,
            onPause,
            onEnd,
            onPlaybackRateChange
        },
        setFunnyMoments,
        resetVideo
    };
};
