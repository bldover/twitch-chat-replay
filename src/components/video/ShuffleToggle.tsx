import { FC } from 'react'
import './ShuffleToggle.css'

type ShuffleToggleProps = {
    enabled: boolean
    onChange: (enabled: boolean) => void
    show: boolean
}

export const ShuffleToggle: FC<ShuffleToggleProps> = ({ enabled, onChange, show }) => {
    if (!show) return null

    return (
        <div className='url-input-group'>
            <div className='shuffle-container'>
                <label className='shuffle-label' htmlFor='shuffleToggle'>
                    Shuffle Playlist
                </label>
                <label className='toggle-switch'>
                    <input
                        id='shuffleToggle'
                        type='checkbox'
                        checked={enabled}
                        onChange={(e) => onChange(e.target.checked)}
                    />
                    <span className='toggle-slider'></span>
                </label>
            </div>
        </div>
    )
}