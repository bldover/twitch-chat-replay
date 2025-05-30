import './Settings.css'
import { FC, useState, useEffect } from 'react'
import { CloseIcon } from './Icons'
import { getChatSelectionIndex, setChatSelectionMode } from '../utils/settings'

interface SettingsModalProps {
    isOpen: boolean
    onClose: () => void
}

const Settings: FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const [tempChatSelectionIndex, setTempChatSelectionIndex] = useState(getChatSelectionIndex())
    const [originalChatSelectionIndex, setOriginalChatSelectionIndex] = useState(getChatSelectionIndex())

    useEffect(() => {
        if (isOpen) {
            const currentIndex = getChatSelectionIndex()
            setTempChatSelectionIndex(currentIndex)
            setOriginalChatSelectionIndex(currentIndex)
        }
    }, [isOpen])

    if (!isOpen) return null

    const handleChatSelectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newIndex = parseInt(event.target.value)
        setTempChatSelectionIndex(newIndex)
    }

    const handleSave = () => {
        setChatSelectionMode(tempChatSelectionIndex)
        onClose()
    }

    const handleDiscard = () => {
        setTempChatSelectionIndex(originalChatSelectionIndex)
        onClose()
    }

    const getAllChatSelectionDescriptions = (): string => {
        return 'Manual: Manually browse and select chat files\nAutomatic Search: Automatically filter chats matching the current video title\nAutomatic Selection: Automatically select the best matching chat (coming soon)'
    }

    return (
        <div className="settings-modal-overlay" onClick={handleDiscard}>
            <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
                <div className="settings-modal-header">
                    <h3>Settings</h3>
                    <button className="settings-modal-close" onClick={handleDiscard}>{CloseIcon({})}</button>
                </div>
                <div className="settings-modal-content">
                    <div className="setting-item">
                        <div className="setting-label">
                            <div className="setting-icon-placeholder">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM1.5 8a6.5 6.5 0 1 0 13 0 6.5 6.5 0 0 0-13 0z"/>
                                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                                </svg>
                            </div>
                            <span 
                                className="setting-name"
                                title={getAllChatSelectionDescriptions()}
                            >
                                Chat Selection
                            </span>
                        </div>
                        <select 
                            className="setting-dropdown"
                            value={tempChatSelectionIndex}
                            onChange={handleChatSelectionChange}
                        >
                            <option value={0}>Manual</option>
                            <option value={1}>Automatic Search</option>
                            <option value={2}>Automatic Selection</option>
                        </select>
                    </div>
                </div>
                <div className="settings-modal-footer">
                    <button className="settings-btn settings-btn-discard" onClick={handleDiscard}>
                        Discard
                    </button>
                    <button className="settings-btn settings-btn-save" onClick={handleSave}>
                        Save
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Settings