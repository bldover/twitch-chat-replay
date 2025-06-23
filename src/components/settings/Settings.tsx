import './Settings.css';
import { FC, useState, useEffect } from 'react';
import { CloseIcon, SettingsIcon } from '../common/Icons';
import { ChatPosition, Theme, AutoSelectConfig, AppSettings } from '../../utils/settings';
import { BadgeOptions as BadgeSettingsType } from '../../utils/badges';
import { useSettings } from '../../contexts/SettingsContext';
import SettingsContent from './SettingsContent';
import TabNavigation, { Tab } from './TabNavigation';

interface SettingsModalProps {
    isOpen: boolean
    onClose: () => void
}

const Settings: FC<SettingsModalProps> = ({ isOpen, onClose }) => {
    const { settings, updateSettings } = useSettings();
    const [tempSettings, setTempSettings] = useState<AppSettings>(settings);
    const [originalSettings, setOriginalSettings] = useState<AppSettings>(settings);
    const [activeTab, setActiveTab] = useState<string>('display');

    const tabs: Tab[] = [
        { id: 'display', label: 'Display' },
        { id: 'behavior', label: 'Chat Behavior' },
        { id: 'selection', label: 'Chat Selection' }
    ];

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
                <TabNavigation
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                />
                <div className='settings-modal-content'>
                    <SettingsContent
                        activeTab={activeTab}
                        tempSettings={tempSettings}
                        onThemeChange={handleThemeChange}
                        onChatPositionChange={handleChatPositionChange}
                        onChatWidthChange={handleChatWidthChange}
                        onChatHeightChange={handleChatHeightChange}
                        onChatDelayChange={handleChatDelayChange}
                        onBadgeToggle={handleBadgeToggle}
                        onAutoSearchToggle={handleAutoSearchToggle}
                        onAutoSelectToggle={handleAutoSelectToggle}
                        onAutoSelectConfigChange={handleAutoSelectConfigChange}
                    />
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
