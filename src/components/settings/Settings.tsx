import './Settings.css';
import { FC, useState, useEffect } from 'react';
import { CloseIcon, SettingsIcon } from '../common/Icons';
import { ChatSelectionMode, ChatPosition, Theme, CHAT_SELECTION_OPTIONS, CHAT_POSITION_OPTIONS, THEME_OPTIONS, getThemeDisplayName, getChatPositionName, AutoSelectConfig, AppSettings } from '../../utils/settings';
import { BadgeOptions as BadgeSettingsType } from '../../utils/badges';
import { useSettings } from '../../contexts/SettingsContext';
import BadgeSettings from './BadgeSettings';
import SettingItem from './SettingItem';
import NumericStepper from './NumericStepper';
import DropdownSelector from './DropdownSelector';

interface SettingsModalProps {
    isOpen: boolean
    onClose: () => void
}

const Settings: FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { settings, updateSettings } = useSettings();
    const [tempSettings, setTempSettings] = useState<AppSettings>(settings);
    const [originalSettings, setOriginalSettings] = useState<AppSettings>(settings);

    useEffect(() => {
        if (isOpen) {
            setTempSettings(settings);
            setOriginalSettings(settings);
        }
    }, [isOpen, settings])

    if (!isOpen) return null

    const getAllChatSelectionDescriptions = (): string => {
        return 'Manual: Manually browse and select chat files\nAuto-search: Automatically filter chats matching the selected video title\nAuto-select: Automatically select the best matching chat based on configurable thresholds';
    };

    const handleChatSelectionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newMode = event.target.value as ChatSelectionMode
        setTempSettings(prev => ({ ...prev, chatSelection: newMode }))
    }

    const handleChatPositionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newPosition = event.target.value as ChatPosition
        setTempSettings(prev => ({ ...prev, chatPosition: newPosition }))
    }

    const handleChatDelayChange = (value: number) => {
        setTempSettings(prev => ({ ...prev, chatDelay: value }))
    }

    const handleChatWidthChange = (value: number) => {
        setTempSettings(prev => ({ ...prev, chatWidth: value }))
    }

    const handleChatHeightChange = (value: number) => {
        setTempSettings(prev => ({ ...prev, chatHeight: value }))
    }

    const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newTheme = event.target.value as Theme
        setTempSettings(prev => ({ ...prev, theme: newTheme }))
    }

    const handleBadgeToggle = (key: keyof BadgeSettingsType) => {
        setTempSettings(prev => ({
            ...prev,
            badges: {
                ...prev.badges,
                [key]: !prev.badges[key]
            }
        }))
    }

    const handleAutoSelectConfigChange = (key: keyof AutoSelectConfig, value: number | boolean) => {
        setTempSettings(prev => ({
            ...prev,
            autoSelectConfig: {
                ...prev.autoSelectConfig,
                [key]: value
            }
        }))
    }

    const handleSave = () => {
        updateSettings(tempSettings)
        onClose()
    }

    const handleDiscard = () => {
        setTempSettings(originalSettings)
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
                            value={tempSettings.theme}
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
                            value={tempSettings.chatPosition}
                            onChange={handleChatPositionChange}
                            name='chatPositionDropdown'
                            options={CHAT_POSITION_OPTIONS.map((position) => ({
                                value: position,
                                label: getChatPositionName(position)
                            }))}
                        />
                    </SettingItem>
                    <SettingItem
                        name='Chat Width'
                        description='Width of the chat sidebar when positioned left/right (in pixels)'
                    >
                        <NumericStepper
                            value={tempSettings.chatWidth}
                            onChange={handleChatWidthChange}
                            name='chatWidthStepper'
                            step={50}
                            min={350}
                            max={Math.floor(window.innerWidth * 0.8)}
                        />
                    </SettingItem>
                    <SettingItem
                        name='Chat Height'
                        description='Height of the chat sidebar when positioned top/bottom (in pixels)'
                    >
                        <NumericStepper
                            value={tempSettings.chatHeight}
                            onChange={handleChatHeightChange}
                            name='chatHeightStepper'
                            step={50}
                            min={350}
                            max={Math.floor(window.innerHeight * 0.8)}
                        />
                    </SettingItem>
                    <SettingItem
                        name='Chat Delay'
                        description='Offset the chat file from the video timestamp (in seconds)'
                    >
                        <NumericStepper
                            value={tempSettings.chatDelay}
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
                            value={tempSettings.badges}
                            onChange={handleBadgeToggle}
                        />
                    </SettingItem>
                    <SettingItem
                        name='Chat Selection'
                        description={getAllChatSelectionDescriptions()}
                    >
                        <DropdownSelector
                            value={tempSettings.chatSelection}
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
                    {tempSettings.chatSelection === 'auto-select' && (
                        <>
                            <SettingItem
                                name='Min Match Threshold'
                                description='Minimum match percentage required for automatic selection (0-100%)'
                            >
                                <NumericStepper
                                    value={tempSettings.autoSelectConfig.minMatchThreshold}
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
                                    value={tempSettings.autoSelectConfig.matchMarginThreshold}
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
                                    value={tempSettings.autoSelectConfig.autoSelectNotificationDuration}
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
