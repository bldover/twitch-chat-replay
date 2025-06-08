import { FC } from 'react'
import { InfoTooltip } from '../common/InfoTooltip'
import { AnimatedPlaceholder } from '../common/AnimatedPlaceholder'
import { urlPlaceholders } from '../../utils/urls'
import './VideoInputField.css'

type VideoInputFieldProps = {
    value: string
    onChange: (value: string) => void
    hasError: boolean
}

export const VideoInputField: FC<VideoInputFieldProps> = ({ value, onChange, hasError }) => {
    return (
        <div className='url-input-group'>
            <div className='url-input-header'>
                <label className='url-input-label' htmlFor='youtubeId'>
                    YouTube URL
                </label>
                <InfoTooltip>
                    <strong>Accepted URLs:</strong>
                    <br />
                    • <strong>Video (?v=123):</strong> Load a single video
                    <br />
                    • <strong>Playlist (?list=abc):</strong> Load playlist with selectable starting video number
                    <br />
                    • <strong>Playlist + Video (?v=123&list=abc):</strong> Load playlist starting at video
                    <br />
                    NOTE: Due to limitations of the YouTube embedded player, only the first 200 videos of a playlist can be played.
                </InfoTooltip>
            </div>
            <div className='url-input-container'>
                <input
                    id='youtubeId'
                    className={`url-input-field${hasError ? ' error' : ''}`}
                    type='text'
                    name='youtubeId'
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    autoFocus
                />
                <AnimatedPlaceholder 
                    placeholders={urlPlaceholders}
                    show={!value}
                />
            </div>
        </div>
    )
}