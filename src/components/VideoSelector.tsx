import { FC, useState, useEffect } from 'react'
import { VideoData } from '../types'
import { CloseIcon } from './Icons'
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

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const result = validateYouTubeUrl(inputValue)
        if (result.isValid && result.data) {
            setHasError(false)
            setErrorMessage('')
            onSubmit(result.data)
        } else {
            setHasError(true)
            setErrorMessage(result.errorMessage || 'Invalid YouTube URL format')
            setTimeout(() => setHasError(false), 600)
        }
    }

    return (
        <div className='video-input-container'>
            <div className='video-input-card'>
                <h1 className='video-input-title'>Twitch Chat Replay</h1>
                <p className='video-input-subtitle'>
                    Recreate Twitch chat next to a YouTube video. Select an available NL chat or upload your own chat!
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
                                <CloseIcon className='info-icon' />
                                {showTooltip && (
                                    <div className='tooltip'>
                                        <div className='tooltip-content'>
                                            <strong>Accepted URL types:</strong>
                                            <br />
                                            • <strong>Video URLs:</strong> Load a single video
                                            <br />
                                            • <strong>Playlist URLs:</strong> Load entire playlist from beginning
                                            <br />
                                            • <strong>Playlist + Video URLs:</strong> Load playlist starting at specific video
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className='url-input-container'>
                            <input
                                id='youtubeId'
                                className={`url-input-field${hasError ? ' error' : ''}`}
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
                        {errorMessage && (
                            <div className={`error-message${errorMessage ? ' show' : ''}`}>
                                {errorMessage}
                            </div>
                        )}
                    </div>
                    <input className='submit-button' type='submit' value='Load Video' />
                </form>
            </div>
        </div>
    )
}