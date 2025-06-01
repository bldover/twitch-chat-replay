import { VideoData } from '../types'

export type ValidationResult = {
    isValid: boolean
    data?: VideoData
    errorMessage?: string
}

export const youtubeRegex = /.*((v=)|(youtu.be\/))([a-zA-Z0-9_-]{11})&?/
export const playlistDirectRegex = /.*[?&]list=([a-zA-Z0-9_-]+)(?:&|$)/
export const playlistWithVideoRegex = /.*[?&]v=([a-zA-Z0-9_-]{11}).*[?&]list=([a-zA-Z0-9_-]+)(?:&|$)/

export const urlPlaceholders = [
    'https://www.youtube.com/watch?v=_Mo6MuMADM0',
    'https://youtu.be/Qus1prVSdcM',
    'https://www.youtube.com/playlist?list=PL1O4GjhJgk40P1PjkmNALfcM7IAwABZkI',
    'https://www.youtube.com/watch?v=XrdT9Ba4EIQ&list=PL1bauNEiHIgx0PbuWqpvWLds4uHCrVERM'
]

export const validateYouTubeUrl = (input: string): ValidationResult => {
    if (!input || input.trim() === '') {
        return { isValid: false, errorMessage: 'Please enter a YouTube URL' }
    }

    const trimmedInput = input.trim()

    const playlistWithVideoMatch = playlistWithVideoRegex.exec(trimmedInput)
    if (playlistWithVideoMatch) {
        const [, videoId, listId] = playlistWithVideoMatch
        return {
            isValid: true,
            data: {
                playlistId: listId,
                videoId: videoId
            }
        }
    }

    const playlistDirectMatch = playlistDirectRegex.exec(trimmedInput)
    if (playlistDirectMatch) {
        const [, listId] = playlistDirectMatch
        return {
            isValid: true,
            data: { playlistId: listId }
        }
    }

    const [, , , , youtubeId] = youtubeRegex.exec(trimmedInput) || []
    if (youtubeId) {
        return {
            isValid: true,
            data: { videoId: youtubeId }
        }
    }

    return {
        isValid: false,
        errorMessage: 'Invalid YouTube URL format'
    }
}

export const extractVideoId = (url: string): string | null => {
    const [, , , , youtubeId] = youtubeRegex.exec(url) || []
    return youtubeId || null
}

export const extractPlaylistId = (url: string): string | null => {
    const [, listId] = playlistDirectRegex.exec(url) || []
    return listId || null
}

export const hasPlaylist = (url: string): boolean => {
    return playlistDirectRegex.test(url)
}

export const isYouTubeVideoUrl = (url: string): boolean => {
    return youtubeRegex.test(url)
}

export const isYouTubePlaylistUrl = (url: string): boolean => {
    return playlistDirectRegex.test(url)
}
