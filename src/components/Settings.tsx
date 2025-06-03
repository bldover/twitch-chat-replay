import './Settings.css'
import { FC, useState, useEffect } from 'react'
import { CloseIcon } from './Icons'
import { getChatSelectionMode, setChatSelectionMode, getChatDelay, setChatDelay, CHAT_SELECTION_OPTIONS, ChatSelectionMode } from '../utils/settings'

interface SettingsModalProps {
    isOpen: boolean
    onClose: () => void
}

const Settings: FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const [tempChatSelectionMode, setTempChatSelectionMode] = useState(getChatSelectionMode())
    const [originalChatSelectionMode, setOriginalChatSelectionMode] = useState(getChatSelectionMode())
    const [tempChatDelay, setTempChatDelay] = useState(getChatDelay())
    const [originalChatDelay, setOriginalChatDelay] = useState(getChatDelay())

    useEffect(() => {
        if (isOpen) {
            const currentMode = getChatSelectionMode()
            const currentDelay = getChatDelay()
            setTempChatSelectionMode(currentMode)
            setOriginalChatSelectionMode(currentMode)
            setTempChatDelay(currentDelay)
            setOriginalChatDelay(currentDelay)
        }
    }, [isOpen])

    if (!isOpen) return null

    const handleChatSelectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newMode = event.target.value as ChatSelectionMode
        setTempChatSelectionMode(newMode)
    }

    const handleChatDelayChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newDelay = parseFloat(event.target.value) || 0
        setTempChatDelay(newDelay)
    }

    const handleSave = () => {
        setChatSelectionMode(tempChatSelectionMode)
        setChatDelay(tempChatDelay)
        onClose()
    }

    const handleDiscard = () => {
        setTempChatSelectionMode(originalChatSelectionMode)
        setTempChatDelay(originalChatDelay)
        onClose()
    }

    const getAllChatSelectionDescriptions = (): string => {
        return 'Manual: Manually browse and select chat files\nAutomatic Search: Automatically filter chats matching the selected video title\nAutomatic Selection: Automatically select the best matching chat (coming soon)'
    }

    return (
        <div className='settings-modal-overlay' onClick={handleDiscard}>
            <div className='settings-modal' onClick={(e) => e.stopPropagation()}>
                <div className='settings-modal-header'>
                    <h3>Settings</h3>
                    <button className='settings-modal-close' onClick={handleDiscard}><CloseIcon /></button>
                </div>
                <div className='settings-modal-content'>
                    <div className='setting-item'>
                        <div className='setting-label'>
                            <div className='setting-icon-placeholder'>
                                <svg width='16' height='16' viewBox='0 0 16 16' fill='currentColor'>
                                    <path d='M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0z' />
                                    <path d='M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z' />
                                </svg>
                            </div>
                            <span
                                className='setting-name'
                                title={getAllChatSelectionDescriptions()}
                            >
                                Chat Selection
                            </span>
                        </div>
                        <select
                            className='setting-dropdown'
                            value={tempChatSelectionMode}
                            onChange={handleChatSelectionChange}
                        >
                            {CHAT_SELECTION_OPTIONS.map((option) => (
                                <option key={option} value={option}>
                                    {option === 'manual' ? 'Manual' :
                                        option === 'automatic-search' ? 'Automatic Search' :
                                            'Automatic Selection'}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className='setting-item'>
                        <div className='setting-label'>
                            <div className='setting-icon-placeholder'>
                                <svg width='16' height='16' viewBox='0 0 16 16' fill='currentColor'>
                                    <path d='M8 3.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9zM8 1a7 7 0 1 1 0 14A7 7 0 0 1 8 1zm0 3.5a.5.5 0 0 1 .5.5v2.5h2a.5.5 0 0 1 0 1h-2.5a.5.5 0 0 1-.5-.5V5a.5.5 0 0 1 .5-.5z' />
                                </svg>
                            </div>
                            <span
                                className='setting-name'
                                title='Delay in seconds to synchronize chat with video. Positive values delay chat, negative values advance chat.'
                            >
                                Chat Delay
                            </span>
                        </div>
                        <input
                            type='number'
                            step='1'
                            className='setting-input'
                            value={tempChatDelay}
                            onChange={handleChatDelayChange}
                            placeholder='0'
                        />
                    </div>
                </div>
                <div className='settings-modal-footer'>
                    <button className='settings-btn settings-btn-discard' onClick={handleDiscard}>
                        Discard
                    </button>
                    <button className='settings-btn settings-btn-save' onClick={handleSave}>
                        Save
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Settings
