import { FC, useState } from 'react'
import { VideoData } from '../../types'
import { validateYouTubeUrl } from '../../utils/urls'
import { VideoInputField } from './VideoInputField'
import { PlaylistIndexInput } from './PlaylistIndexInput'
import { ShuffleToggle } from './ShuffleToggle'
import './VideoSelector.css'

type VideoSelectorProps = {
    onSubmit: (data: VideoData) => void
}

export const VideoSelector: FC<VideoSelectorProps> = ({ onSubmit }) => {
    const [hasError, setHasError] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [urlValue, setUrlValue] = useState('')
    const [playlistIndex, setPlaylistIndex] = useState(1)
    const [showPlaylistIndex, setShowPlaylistIndex] = useState(false)
    const [errorField, setErrorField] = useState<'url' | 'index' | null>(null)
    const [shuffleEnabled, setShuffleEnabled] = useState(false)
    const [showShuffle, setShowShuffle] = useState(false)

    const onUrlChange = (url: string) => {
        setUrlValue(url)
        const result = validateYouTubeUrl(url)
        if (result.isValid && result.data?.playlistId) {
            setShowShuffle(true)
            setShowPlaylistIndex(!result.data?.initialVideoId)
        } else {
            setShowPlaylistIndex(false)
            setPlaylistIndex(1)
            setShowShuffle(false)
            setShuffleEnabled(false)
        }
    }

    const onIndexChange = (index: string) => {
        const indexValue = parseInt(index)
        if (!indexValue || isNaN(indexValue)) {
            setPlaylistIndex(NaN)
        } else {
            setPlaylistIndex(indexValue)
        }
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const result = validateYouTubeUrl(urlValue)
        if (result.isValid && result.data) {
            setHasError(false)
            setErrorMessage('')
            setErrorField(null)

            if (showPlaylistIndex) {
                if (isNaN(playlistIndex)) {
                    setHasError(true)
                    setErrorMessage('Please enter a video number')
                    setErrorField('index')
                    setTimeout(() => setHasError(false), 600)
                    return
                } else if (playlistIndex < 1) {
                    setHasError(true)
                    setErrorMessage('Video numbers start at 1')
                    setErrorField('index')
                    setTimeout(() => setHasError(false), 600)
                    return
                } else if (playlistIndex > 200) {
                    setHasError(true)
                    setErrorMessage('Video number cannot be greater than 200. The embedded YouTube player does not support playlists larger than 200 videos.')
                    setErrorField('index')
                    setTimeout(() => setHasError(false), 600)
                    return
                }
                result.data.initialVideoIndex = playlistIndex
            }

            result.data.shuffleEnabled = shuffleEnabled

            onSubmit(result.data)
        } else {
            setHasError(true)
            setErrorMessage(result.errorMessage || 'Invalid YouTube URL format')
            setErrorField('url')
            setTimeout(() => setHasError(false), 800)
        }
    }

    return (
        <div className='video-input-container'>
            <div className='video-input-card'>
                <div className='video-input-content'>
                    <h1 className='video-input-title'>Twitch Chat Replay</h1>
                    <p className='video-input-subtitle'>
                        Recreate Twitch chat next to a YouTube video. Select an available Northernlion VOD or upload any chat!
                    </p>
                    <form className='url-input-form' onSubmit={handleSubmit}>
                        <VideoInputField
                            value={urlValue}
                            onChange={onUrlChange}
                            hasError={hasError && errorField === 'url'}
                        />
                        <PlaylistIndexInput
                            value={playlistIndex}
                            onChange={onIndexChange}
                            hasError={hasError && errorField === 'index'}
                            show={showPlaylistIndex}
                        />
                        <ShuffleToggle
                            enabled={shuffleEnabled}
                            onChange={setShuffleEnabled}
                            show={showShuffle}
                        />
                        {errorMessage && (
                            <div className={`error-message${errorMessage ? ' show' : ''}`}>
                                {errorMessage}
                            </div>
                        )}
                        <input className='submit-button' type='submit' value='Load Video' />
                    </form>
                </div>
            </div>
        </div>
    )
}
