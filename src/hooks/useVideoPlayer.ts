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
        onVideoChange: (event: YouTubeEvent) => void;
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
        playState: 'initializing',
        playbackRate: 1
    });

    const selectVideo = useCallback((data: VideoData): void => {
        console.debug('selectVideo: ', data);
        const videoData = {
            ...data,
            currentVideoId: data.initialVideoId
        };
        setState(prev => ({ ...prev, videoData: videoData }));
        if (data.initialVideoId) {
            setQueryParam('youtubeId', data.initialVideoId);
        }
        if (data.playlistId) {
            setQueryParam('playlistId', data.playlistId);
        }
    }, []);

    const onReady = useCallback((event: YouTubeEvent): void => {
        console.debug('onReady');
        const player = event.target;
        console.debug(player)

        setState(prev => ({
            ...prev,
            videoPlayer: player,
            videoMetadata: {
                title: player.playerInfo.videoData.title,
                duration: player.getDuration()
            }
        }));

        if (state.videoData?.shuffleEnabled && state.videoData?.playlistId) {
            player.setShuffle(true);
            if (!state.videoData?.initialVideoId) {
                player.playVideoAt(0);
            }
        }
    }, [state.videoData]);

    const onVideoChange = useCallback((event: YouTubeEvent): void => {
        console.debug('onVideoChange');
        const player = event.target;
        const newVideoId = player.playerInfo?.videoData?.video_id;
        setQueryParam('youtubeId', newVideoId);
        console.debug(player)
        setState(prev => ({
            ...prev,
            videoData: {
                ...prev.videoData!,
                currentVideoId: newVideoId
            },
            videoMetadata: {
                title: player.playerInfo.videoData.title,
                duration: player.getDuration()
            }
        }));
    }, []);

    const onPlay = useCallback((event: YouTubeEvent): void => {
        console.debug('onPlay');
        setState(prev => ({ ...prev, playState: 'playing' }));
    }, []);

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

    if (state.playState === 'initializing') {
        const youtubeId = getQueryParam('youtubeId');
        const playlistId = getQueryParam('playlistId');
        if (!state.videoData && youtubeId) {
            console.debug(`queryParams change new: youtubeId=${youtubeId}, playlistId=${playlistId}`);
            selectVideo({
                initialVideoId: youtubeId,
                playlistId: playlistId || undefined
            });
        }
    }

    return {
        videoState: state,
        selectVideo,
        videoHandlers: {
            onReady,
            onPlay,
            onPause,
            onVideoChange,
            onEnd,
            onPlaybackRateChange
        },
        setFunnyMoments,
        resetVideo
    };
};
