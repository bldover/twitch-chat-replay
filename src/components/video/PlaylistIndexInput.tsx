import { FC } from 'react'
import { InfoTooltip } from '../common/InfoTooltip'
import './PlaylistIndexInput.css'

type PlaylistIndexInputProps = {
    value: number
    onChange: (value: string) => void
    hasError: boolean
    show: boolean
}

export const PlaylistIndexInput: FC<PlaylistIndexInputProps> = ({ value, onChange, hasError, show }) => {
    if (!show) return null

    return (
        <div className='url-input-group'>
            <div className='url-input-header'>
                <label className='url-input-label' htmlFor='playlistIndex'>
                    Playlist Video Number
                </label>
                <InfoTooltip>
                    Enter which video in the playlist to start with (e.g., enter 3 to start at the 3rd video)
                </InfoTooltip>
            </div>
            <div className='url-input-container'>
                <input
                    id='playlistIndex'
                    className={`url-input-field${hasError ? ' error' : ''}`}
                    type='number'
                    name='playlistIndex'
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder='1'
                />
            </div>
        </div>
    )
}
