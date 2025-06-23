import './Settings.css';
import { FC, useState, useEffect } from 'react';
import { CloseIcon, SettingsIcon } from '../common/Icons';
import { ChatPosition, Theme, CHAT_POSITION_OPTIONS, THEME_OPTIONS, getThemeDisplayName, getChatPositionName, AutoSelectConfig, AppSettings } from '../../utils/settings';
import { BadgeOptions as BadgeSettingsType } from '../../utils/badges';
import { useSettings } from '../../contexts/SettingsContext';
import BadgeSettings from './BadgeSettings';
import SettingItem from './SettingItem';
import NumericStepper from './NumericStepper';
import DropdownSelector from './DropdownSelector';
import SimpleCheckbox from './SimpleCheckbox';

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

    const handleAutoSearchToggle = (enabled: boolean) => {
        setTempSettings(prev => ({ ...prev, autoSearch: enabled }));
    };

    const handleAutoSelectToggle = (enabled: boolean) => {
        setTempSettings(prev => ({
            ...prev,
            autoSelect: enabled,
            autoSearch: enabled ? true : prev.autoSearch
        }));
    };

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
                    <div className='settings-section'>
                        <h4>Display</h4>
                        <SettingItem
                            name='Theme'
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
                    </div>

                    <div className='settings-section'>
                        <h4>Chat Behavior</h4>
                        <SettingItem
                            name='Chat Delay (s)'
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
                            showGlow={false}
                        >
                            <BadgeSettings
                                value={tempSettings.badges}
                                onChange={handleBadgeToggle}
                            />
                        </SettingItem>
                    </div>

                    <div className='settings-section'>
                        <h4>Chat Selection</h4>
                        <p className='settings-section-description'>
                            [Placeholder text for Chat Selection section description - to be filled in]
                        </p>
                        <SettingItem
                            name='Auto Search'
                            description='Identify and rank chats similar to the selected video title'
                            showGlow={false}
                        >
                            <SimpleCheckbox
                                checked={tempSettings.autoSearch}
                                onChange={handleAutoSearchToggle}
                                name='autoSearchToggle'
                            />
                        </SettingItem>
                        <SettingItem
                            name='Auto Select'
                            description="Select the best matching chat if the below criteria are met. Works for most series"
                            showGlow={false}
                        >
                            <SimpleCheckbox
                                checked={tempSettings.autoSelect}
                                onChange={handleAutoSelectToggle}
                                name='autoSelectToggle'
                            />
                        </SettingItem>
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
                                disabled={!tempSettings.autoSelect}
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
                                disabled={!tempSettings.autoSelect}
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
                                disabled={!tempSettings.autoSelect}
                            />
                        </SettingItem>
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
