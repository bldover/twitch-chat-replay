import './Settings.css';
import { FC, useState, useEffect } from 'react';
import { CloseIcon, SettingsIcon } from '../common/Icons';
import { ChatPosition, Theme, AutoSelectConfig, AppSettings } from '../../utils/settings';
import { BadgeOptions as BadgeSettingsType } from '../../utils/badges';
import { useSettings } from '../../contexts/SettingsContext';
import SettingsContent from './SettingsContent';
import TabNavigation, { Tab } from './TabNavigation';
import { EmoteSource } from '../../types';
import { processEmoteFile } from '../../utils/emoteFileProcessor';

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
        { id: 'selection', label: 'Chat Selection' },
        { id: 'emotes', label: 'Emotes' }
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

    const handleEmoteEnabledToggle = (type: EmoteSource, enabled: boolean) => {
        setTempSettings(prev => ({
            ...prev,
            customEmotes: {
                ...prev.customEmotes,
                [type]: {
                    ...prev.customEmotes[type],
                    enabled
                }
            }
        }));
    };

    const handleEmoteFileSelect = (type: EmoteSource, fileId: string) => {
        setTempSettings(prev => ({
            ...prev,
            customEmotes: {
                ...prev.customEmotes,
                [type]: {
                    ...prev.customEmotes[type],
                    selectedFileId: fileId
                }
            }
        }));
    };

    const handleEmoteFileAdd = async (type: EmoteSource, file: File) => {
        try {
            const emoteFileConfig = await processEmoteFile(file, type);
            setTempSettings(prev => ({
                ...prev,
                customEmotes: {
                    ...prev.customEmotes,
                    [type]: {
                        ...prev.customEmotes[type],
                        files: [...prev.customEmotes[type].files, emoteFileConfig],
                        selectedFileId: emoteFileConfig.id
                    }
                }
            }));
        } catch (error) {
            alert(`Error adding emote file: ${error instanceof Error ? error.message : 'Unknown error'}`);
            throw error;
        }
    };

    const handleEmoteFileDelete = (type: EmoteSource, fileId: string) => {
        setTempSettings(prev => {
            const typeSettings = prev.customEmotes[type];
            const newFiles = typeSettings.files.filter(f => f.id !== fileId);
            const newSelectedFileId = typeSettings.selectedFileId === fileId
                ? (newFiles.length > 0 ? newFiles[0].id : null)
                : typeSettings.selectedFileId;

            return {
                ...prev,
                customEmotes: {
                    ...prev.customEmotes,
                    [type]: {
                        ...typeSettings,
                        files: newFiles,
                        selectedFileId: newSelectedFileId
                    }
                }
            };
        });
    };

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
                        onEmoteEnabledToggle={handleEmoteEnabledToggle}
                        onEmoteFileSelect={handleEmoteFileSelect}
                        onEmoteFileAdd={handleEmoteFileAdd}
                        onEmoteFileDelete={handleEmoteFileDelete}
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
