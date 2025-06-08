import './Settings.css'
import { FC, useState, useEffect } from 'react'
import { CloseIcon, SettingsIcon } from './common/Icons'
import NumericStepper from './common/NumericStepper'
import DropdownSelector from './common/DropdownSelector'
import { getChatSelectionMode, setChatSelectionMode, getChatDelay, setChatDelay, getTheme, setTheme, getThemeDisplayName, CHAT_SELECTION_OPTIONS, THEME_OPTIONS, ChatSelectionMode } from '../utils/settings'
import { Theme } from '../types'

interface SettingsModalProps {
    isOpen: boolean
    onClose: () => void
    updateChatDelay: (delay: number) => void
    updateTheme: (theme: Theme) => void
}

const Settings: FC<SettingsModalProps> = ({ isOpen, onClose, updateChatDelay, updateTheme }) => {
    const [tempChatSelectionMode, setTempChatSelectionMode] = useState(getChatSelectionMode())
    const [originalChatSelectionMode, setOriginalChatSelectionMode] = useState(getChatSelectionMode())
    const [tempChatDelay, setTempChatDelay] = useState(getChatDelay())
    const [originalChatDelay, setOriginalChatDelay] = useState(getChatDelay())
    const [tempTheme, setTempTheme] = useState(getTheme())
    const [originalTheme, setOriginalTheme] = useState(getTheme())

    useEffect(() => {
        if (isOpen) {
            const currentMode = getChatSelectionMode()
            const currentDelay = getChatDelay()
            const currentTheme = getTheme()
            setTempChatSelectionMode(currentMode)
            setOriginalChatSelectionMode(currentMode)
            setTempChatDelay(currentDelay)
            setOriginalChatDelay(currentDelay)
            setTempTheme(currentTheme)
            setOriginalTheme(currentTheme)
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

    const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newTheme = event.target.value as Theme
        setTempTheme(newTheme)
    }

    const handleSave = () => {
        setChatSelectionMode(tempChatSelectionMode)
        setChatDelay(tempChatDelay)
        setTheme(tempTheme)
        updateChatDelay(tempChatDelay)
        updateTheme(tempTheme)
        onClose()
    }

    const handleDiscard = () => {
        setTempChatSelectionMode(originalChatSelectionMode)
        setTempChatDelay(originalChatDelay)
        setTempTheme(originalTheme)
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
                                title='Choose the color theme for the application interface.'
                            >
                                Theme
                            </span>
                        </div>
                        <DropdownSelector
                            value={tempTheme}
                            onChange={handleThemeChange}
                            name='themeDropdown'
                            options={THEME_OPTIONS.map((theme) => ({
                                value: theme,
                                label: getThemeDisplayName(theme)
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
