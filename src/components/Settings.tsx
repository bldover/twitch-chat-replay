import './Settings.css'
import { FC, useState, useEffect } from 'react'
import { CloseIcon, SettingsIcon } from './Icons'
import NumericStepper from './NumericStepper'
import DropdownSelector from './DropdownSelector'
import { getChatSelectionMode, setChatSelectionMode, getChatDelay, setChatDelay, CHAT_SELECTION_OPTIONS, ChatSelectionMode } from '../utils/settings'

interface SettingsModalProps {
    isOpen: boolean
    onClose: () => void
    updateChatDelay: (delay: number) => void
}

const Settings: FC<SettingsModalProps> = ({ isOpen, onClose, updateChatDelay }) => {
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

    const handleChatDelayChange = (value: number) => {
        setTempChatDelay(value)
    }

    const handleSave = () => {
        setChatSelectionMode(tempChatSelectionMode)
        setChatDelay(tempChatDelay)
        updateChatDelay(tempChatDelay)
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
                    <div className='settings-modal-title'>
                        <SettingsIcon />
                        <h3>Settings</h3>
                    </div>
                    <button className='settings-modal-close' onClick={handleDiscard}><CloseIcon /></button>
                </div>
                <div className='settings-modal-content'>
                    <div className='setting-item'>
                        <div className='setting-label'>
                            <span
                                className='setting-name'
                                title={getAllChatSelectionDescriptions()}
                            >
                                Chat Selection
                            </span>
                        </div>
                        <DropdownSelector
                            value={tempChatSelectionMode}
                            onChange={handleChatSelectionChange}
                            name='chatSelectionDropdown'
                            options={CHAT_SELECTION_OPTIONS.map((option) => ({
                                value: option,
                                label: option === 'manual' ? 'Manual' :
                                    option === 'automatic-search' ? 'Automatic Search' :
                                        'Automatic Selection'
                            }))}
                        />
                    </div>
                    <div className='setting-item'>
                        <div className='setting-label'>
                            <span
                                className='setting-name'
                                title='Delay in seconds to synchronize chat with video. Positive values delay chat, negative values advance chat.'
                            >
                                Chat Delay
                            </span>
                        </div>
                        <NumericStepper
                            value={tempChatDelay}
                            onChange={handleChatDelayChange}
                            name='chatDelayStepper'
                            step={1}
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
