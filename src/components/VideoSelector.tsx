import { FC, useState, useEffect } from 'react'
import { VideoData } from '../types'
import { InfoIcon } from './Icons'
import { validateYouTubeUrl, urlPlaceholders } from '../utils/urls'
import './VideoSelector.css'

type VideoSelectorProps = {
    onSubmit: (data: VideoData) => void
}

export const VideoSelector: FC<VideoSelectorProps> = ({ onSubmit }) => {
    const [hasError, setHasError] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [currentPlaceholder, setCurrentPlaceholder] = useState(0)
    const [placeholderOpacity, setPlaceholderOpacity] = useState(1)
    const [inputValue, setInputValue] = useState('')
    const [showTooltip, setShowTooltip] = useState(false)
    const [showIndexTooltip, setShowIndexTooltip] = useState(false)
    const [playlistIndex, setPlaylistIndex] = useState('1')
    const [showPlaylistIndex, setShowPlaylistIndex] = useState(false)
    const [errorField, setErrorField] = useState<'url' | 'index' | null>(null)

    useEffect(() => {
        const interval = setInterval(() => {
            setPlaceholderOpacity(0)
            setTimeout(() => {
                setCurrentPlaceholder(prev => (prev + 1) % urlPlaceholders.length)
                setPlaceholderOpacity(1)
            }, 300)
        }, 3000)

        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        const result = validateYouTubeUrl(inputValue)
        if (result.isValid && result.data?.playlistId && !result.data?.initialVideoId) {
            setShowPlaylistIndex(true)
            setPlaylistIndex('1')
        } else {
            setShowPlaylistIndex(false)
            setPlaylistIndex('1')
        }
    }, [inputValue])

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const result = validateYouTubeUrl(inputValue)
        if (result.isValid && result.data) {
            setHasError(false)
            setErrorMessage('')
            setErrorField(null)

            if (showPlaylistIndex) {
                const indexValue = parseInt(playlistIndex)
                if (!playlistIndex || isNaN(indexValue)) {
                    setHasError(true)
                    setErrorMessage('Please enter a video number')
                    setErrorField('index')
                    setTimeout(() => setHasError(false), 600)
                    return
                } else if (indexValue < 1) {
                    setHasError(true)
                    setErrorMessage('Video numbers start at 1')
                    setErrorField('index')
                    setTimeout(() => setHasError(false), 600)
                    return
                } else if (indexValue > 200) {
                    setHasError(true)
                    setErrorMessage('Video number cannot be greater than 200. The embedded YouTube player does not support playlists larger than 200 videos.')
                    setErrorField('index')
                    setTimeout(() => setHasError(false), 600)
                    return
                }
                result.data.initialVideoIndex = indexValue
            }

            onSubmit(result.data)
        } else {
            setHasError(true)
            setErrorMessage(result.errorMessage || 'Invalid YouTube URL format')
            setErrorField('url')
            setTimeout(() => setHasError(false), 600)
        }
    }

    return (
        <div className='video-input-container'>
            <div className='video-input-card'>
                <h1 className='video-input-title'>Twitch Chat Replay</h1>
                <p className='video-input-subtitle'>
                    Recreate Twitch chat next to a YouTube video. Select an available Northernlion VOD or upload any chat!
                </p>

                <form className='url-input-form' onSubmit={handleSubmit}>
                    <div className='url-input-group'>
                        <div className='url-input-header'>
                            <label className='url-input-label' htmlFor='youtubeId'>
                                YouTube URL
                            </label>
                            <div
                                className='info-icon-container'
                                onMouseEnter={() => setShowTooltip(true)}
                                onMouseLeave={() => setShowTooltip(false)}
                            >
                                <InfoIcon className='info-icon' />
                                {showTooltip && (
                                    <div className='tooltip'>
                                        <div className='tooltip-content'>
                                            <strong>Accepted URL types:</strong>
                                            <br />
                                            • <strong>Video URL:</strong> Load a single video
                                            <br />
                                            • <strong>Playlist URL:</strong> Load entire playlist from specified video number
                                            <br />
                                            • <strong>Playlist + Video URL:</strong> Load playlist starting at specific video
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className='url-input-container'>
                            <input
                                id='youtubeId'
                                className={`url-input-field${hasError && errorField === 'url' ? ' error' : ''}`}
                                type='text'
                                name='youtubeId'
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                autoFocus
                            />
                            {!inputValue && (
                                <div
                                    className='animated-placeholder'
                                    style={{ opacity: placeholderOpacity }}
                                >
                                    {urlPlaceholders[currentPlaceholder]}
                                </div>
                            )}
                        </div>
                    </div>

                    {showPlaylistIndex && (
                        <div className='url-input-group'>
                            <div className='url-input-header'>
                                <label className='url-input-label' htmlFor='playlistIndex'>
                                    Playlist Video Number
                                </label>
                                <div
                                    className='info-icon-container'
                                    onMouseEnter={() => setShowIndexTooltip(true)}
                                    onMouseLeave={() => setShowIndexTooltip(false)}
                                >
                                    <InfoIcon className='info-icon' />
                                    {showIndexTooltip && (
                                        <div className='tooltip'>
                                            <div className='tooltip-content'>
                                                Enter which video in the playlist to start with (e.g., enter 3 to start at the 3rd video)
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className='url-input-container'>
                                <input
                                    id='playlistIndex'
                                    className={`url-input-field${hasError && errorField === 'index' ? ' error' : ''}`}
                                    type='number'
                                    name='playlistIndex'
                                    value={playlistIndex}
                                    onChange={(e) => setPlaylistIndex(e.target.value)}
                                    placeholder='1'
                                />
                            </div>
                        </div>
                    )}

                    {errorMessage && (
                        <div className={`error-message${errorMessage ? ' show' : ''}`}>
                            {errorMessage}
                        </div>
                    )}

                    <input className='submit-button' type='submit' value='Load Video' />
                </form>
            </div>
        </div>
    )
}
