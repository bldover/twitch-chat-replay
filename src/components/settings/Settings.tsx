import './Settings.css';
import { FC, useState, useEffect } from 'react';
import { CloseIcon, SettingsIcon } from '../common/Icons';
import { getChatSelectionMode, setChatSelectionMode, getChatPosition, setChatPosition, getChatDelay, setChatDelay, getTheme, setTheme, getBadgeSettings, setBadgeSettings, getAutoSelectConfig, setAutoSelectConfig, ChatSelectionMode, ChatPosition, CHAT_SELECTION_OPTIONS, CHAT_POSITION_OPTIONS, THEME_OPTIONS, getThemeDisplayName, getChatPositionDisplayName, AutoSelectConfig } from '../../utils/settings';
import { Theme } from '../../types';
import { BadgeSettings as BadgeSettingsType } from '../../utils/badges';
import BadgeSettings from './BadgeSettings';
import SettingItem from './SettingItem';
import NumericStepper from './NumericStepper';
import DropdownSelector from './DropdownSelector';

interface SettingsModalProps {
    isOpen: boolean
    onClose: () => void
    updateChatDelay: (delay: number) => void
    updateTheme: (theme: Theme) => void
    updateBadgeSettings?: (badges: BadgeSettingsType) => void
    updateChatPosition: (position: ChatPosition) => void
}

const Settings: FC<SettingsModalProps> = ({ isOpen, onClose, updateChatDelay, updateTheme, updateBadgeSettings, updateChatPosition }) => {
    const [tempChatSelectionMode, setTempChatSelectionMode] = useState(getChatSelectionMode())
    const [originalChatSelectionMode, setOriginalChatSelectionMode] = useState(getChatSelectionMode())
    const [tempChatPosition, setTempChatPosition] = useState(getChatPosition())
    const [originalChatPosition, setOriginalChatPosition] = useState(getChatPosition())
    const [tempChatDelay, setTempChatDelay] = useState(getChatDelay())
    const [originalChatDelay, setOriginalChatDelay] = useState(getChatDelay())
    const [tempTheme, setTempTheme] = useState(getTheme())
    const [originalTheme, setOriginalTheme] = useState(getTheme())
    const [tempBadgeSettings, setTempBadgeSettings] = useState(getBadgeSettings())
    const [originalBadgeSettings, setOriginalBadgeSettings] = useState(getBadgeSettings())
    const [tempAutoSelectConfig, setTempAutoSelectConfig] = useState(getAutoSelectConfig())
    const [originalAutoSelectConfig, setOriginalAutoSelectConfig] = useState(getAutoSelectConfig())

    useEffect(() => {
        if (isOpen) {
            const currentMode = getChatSelectionMode()
            const currentPosition = getChatPosition()
            const currentDelay = getChatDelay()
            const currentTheme = getTheme()
            const currentBadgeSettings = getBadgeSettings()
            const currentAutoSelectConfig = getAutoSelectConfig()
            setTempChatSelectionMode(currentMode)
            setOriginalChatSelectionMode(currentMode)
            setTempChatPosition(currentPosition)
            setOriginalChatPosition(currentPosition)
            setTempChatDelay(currentDelay)
            setOriginalChatDelay(currentDelay)
            setTempTheme(currentTheme)
            setOriginalTheme(currentTheme)
            setTempBadgeSettings(currentBadgeSettings)
            setOriginalBadgeSettings(currentBadgeSettings)
            setTempAutoSelectConfig(currentAutoSelectConfig)
            setOriginalAutoSelectConfig(currentAutoSelectConfig)
        }
    }, [isOpen])

    if (!isOpen) return null

    const getAllChatSelectionDescriptions = (): string => {
        return 'Manual: Manually browse and select chat files\nAuto-search: Automatically filter chats matching the selected video title\nAuto-select: Automatically select the best matching chat based on configurable thresholds';
    };

    const handleChatSelectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newMode = event.target.value as ChatSelectionMode
        setTempChatSelectionMode(newMode)
    }

    const handleChatPositionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newPosition = event.target.value as ChatPosition
        setTempChatPosition(newPosition)
    }

    const handleChatDelayChange = (value: number) => {
        setTempChatDelay(value)
    }

    const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newTheme = event.target.value as Theme
        setTempTheme(newTheme)
    }

    const handleBadgeToggle = (key: keyof BadgeSettingsType) => {
        setTempBadgeSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }))
    }

    const handleAutoSelectConfigChange = (key: keyof AutoSelectConfig, value: number | boolean) => {
        setTempAutoSelectConfig(prev => ({
            ...prev,
            [key]: value
        }))
    }


    const handleSave = () => {
        setChatSelectionMode(tempChatSelectionMode)
        setChatPosition(tempChatPosition)
        setChatDelay(tempChatDelay)
        setTheme(tempTheme)
        setBadgeSettings(tempBadgeSettings)
        setAutoSelectConfig(tempAutoSelectConfig)
        updateChatDelay(tempChatDelay)
        updateTheme(tempTheme)
        updateBadgeSettings?.(tempBadgeSettings)
        updateChatPosition(tempChatPosition)
        onClose()
    }

    const handleDiscard = () => {
        setTempChatSelectionMode(originalChatSelectionMode)
        setTempChatPosition(originalChatPosition)
        setTempChatDelay(originalChatDelay)
        setTempTheme(originalTheme)
        setTempBadgeSettings(originalBadgeSettings)
        setTempAutoSelectConfig(originalAutoSelectConfig)
        onClose()
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
                    <SettingItem
                        name='Theme'
                        description='Color theme for the application'
                    >
                        <DropdownSelector
                            value={tempTheme}
                            onChange={handleThemeChange}
                            name='themeDropdown'
                            options={THEME_OPTIONS.map((theme) => ({
                                value: theme,
                                label: getThemeDisplayName(theme)
                            }))}
                        />
                    </SettingItem>
                    <SettingItem
                        name='Chat Position'
                        description='Position of the chat sidebar relative to the video'
                    >
                        <DropdownSelector
                            value={tempChatPosition}
                            onChange={handleChatPositionChange}
                            name='chatPositionDropdown'
                            options={CHAT_POSITION_OPTIONS.map((position) => ({
                                value: position,
                                label: getChatPositionDisplayName(position)
                            }))}
                        />
                    </SettingItem>
                    <SettingItem
                        name='Chat Delay'
                        description='Offset the chat file from the video timestamp (in seconds)'
                    >
                        <NumericStepper
                            value={tempChatDelay}
                            onChange={handleChatDelayChange}
                            name='chatDelayStepper'
                            step={1}
                        />
                    </SettingItem>
                    <SettingItem
                        name='Chat Badges'
                        description='Show user badges before usernames in chat'
                    >
                        <BadgeSettings
                            value={tempBadgeSettings}
                            onChange={handleBadgeToggle}
                        />
                    </SettingItem>
                    <SettingItem
                        name='Chat Selection'
                        description={getAllChatSelectionDescriptions()}
                    >
                        <DropdownSelector
                            value={tempChatSelectionMode}
                            onChange={handleChatSelectionChange}
                            name='chatSelectionDropdown'
                            options={CHAT_SELECTION_OPTIONS.map((option) => ({
                                value: option,
                                label: option === 'manual' ? 'Manual' :
                                    option === 'auto-search' ? 'Auto-search' :
                                        'Auto-select'
                            }))}
                        />
                    </SettingItem>
                    {tempChatSelectionMode === 'auto-select' && (
                        <>
                            <SettingItem
                                name='Min Match Threshold'
                                description='Minimum match percentage required for automatic selection (0-100%)'
                            >
                                <NumericStepper
                                    value={tempAutoSelectConfig.minMatchThreshold}
                                    onChange={(value) => handleAutoSelectConfigChange('minMatchThreshold', value)}
                                    name='minMatchThresholdStepper'
                                    step={5}
                                    min={0}
                                    max={100}
                                />
                            </SettingItem>
                            <SettingItem
                                name='Match Margin Threshold'
                                description='Required percentage gap between best and second best match (0-100%)'
                            >
                                <NumericStepper
                                    value={tempAutoSelectConfig.matchMarginThreshold}
                                    onChange={(value) => handleAutoSelectConfigChange('matchMarginThreshold', value)}
                                    name='matchMarginThresholdStepper'
                                    step={5}
                                    min={0}
                                    max={100}
                                />
                            </SettingItem>
                            <SettingItem
                                name='Auto-select Notification Duration'
                                description='How long to show the auto-selected chat notification (0 = disabled, 1-60 seconds)'
                            >
                                <NumericStepper
                                    value={tempAutoSelectConfig.autoSelectNotificationDuration}
                                    onChange={(value) => handleAutoSelectConfigChange('autoSelectNotificationDuration', value)}
                                    name='notificationDurationStepper'
                                    step={1}
                                    min={0}
                                    max={60}
                                />
                            </SettingItem>
                        </>
                    )}
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
