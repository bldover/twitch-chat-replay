import './SettingsContent.css';
import { FC } from 'react';
import { CHAT_POSITION_OPTIONS, THEME_OPTIONS, getThemeDisplayName, getChatPositionName, AutoSelectConfig, AppSettings } from '../../utils/settings';
import { BadgeOptions as BadgeSettingsType } from '../../utils/badges';
import BadgeSettings from './BadgeSettings';
import SettingItem from './SettingItem';
import NumericStepper from './NumericStepper';
import DropdownSelector from './DropdownSelector';
import SimpleCheckbox from './SimpleCheckbox';

interface SettingsContentProps {
    activeTab: string;
    tempSettings: AppSettings;
    onThemeChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    onChatPositionChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    onChatWidthChange: (value: number) => void;
    onChatHeightChange: (value: number) => void;
    onChatDelayChange: (value: number) => void;
    onBadgeToggle: (key: keyof BadgeSettingsType) => void;
    onAutoSearchToggle: (enabled: boolean) => void;
    onAutoSelectToggle: (enabled: boolean) => void;
    onAutoSelectConfigChange: (key: keyof AutoSelectConfig, value: number | boolean) => void;
}

const SettingsContent: FC<SettingsContentProps> = ({
    activeTab,
    tempSettings,
    onThemeChange,
    onChatPositionChange,
    onChatWidthChange,
    onChatHeightChange,
    onChatDelayChange,
    onBadgeToggle,
    onAutoSearchToggle,
    onAutoSelectToggle,
    onAutoSelectConfigChange
}) => {
    const renderTabContent = () => {
        switch (activeTab) {
            case 'display':
                return (
                    <>
                        <SettingItem
                            name='Theme'
                        >
                            <DropdownSelector
                                value={tempSettings.theme}
                                onChange={onThemeChange}
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
                                onChange={onChatPositionChange}
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
                                onChange={onChatWidthChange}
                                name='chatWidthStepper'
                                step={50}
                                min={350}
                                max={Math.floor(window.innerWidth * 0.8)}
                                disabled={tempSettings.chatPosition === 'auto'}
                            />
                        </SettingItem>
                        <SettingItem
                            name='Chat Height'
                        >
                            <NumericStepper
                                value={tempSettings.chatHeight}
                                onChange={onChatHeightChange}
                                name='chatHeightStepper'
                                step={50}
                                min={350}
                                max={Math.floor(window.innerHeight * 0.8)}
                                disabled={tempSettings.chatPosition === 'auto'}
                            />
                        </SettingItem>
                    </>
                );

            case 'behavior':
                return (
                    <>
                        <SettingItem
                            name='Chat Delay (s)'
                        >
                            <NumericStepper
                                value={tempSettings.chatDelay}
                                onChange={onChatDelayChange}
                                name='chatDelayStepper'
                                step={1}
                            />
                        </SettingItem>
                        <SettingItem
                            name='Chat Badges'
                        >
                            <BadgeSettings
                                value={tempSettings.badges}
                                onChange={onBadgeToggle}
                            />
                        </SettingItem>
                    </>
                );

            case 'selection':
                return (
                    <>
                        <p className='settings-section-description'>
                            Chats are archived for Northernlion VODs since March 4, 2016. The YT and VOD titles are often similar enough that they can be matched up automatically.
                        </p>
                        <SettingItem
                            name='Automatic Search'
                            showGlow={false}
                        >
                            <SimpleCheckbox
                                checked={tempSettings.autoSearch}
                                onChange={onAutoSearchToggle}
                                name='autoSearchToggle'
                            />
                        </SettingItem>
                        <SettingItem
                            name='Automatic Selection'
                            showGlow={false}
                        >
                            <SimpleCheckbox
                                checked={tempSettings.autoSelect}
                                onChange={onAutoSelectToggle}
                                name='autoSelectToggle'
                            />
                        </SettingItem>
                        <SettingItem
                            name='Autoselect Match Threshold'
                            description='Only autoselect if the best match has at least this match %'
                        >
                            <NumericStepper
                                value={tempSettings.autoSelectConfig.minMatchThreshold}
                                onChange={(value) => onAutoSelectConfigChange('minMatchThreshold', value)}
                                name='minMatchThresholdStepper'
                                step={5}
                                min={0}
                                max={100}
                                disabled={!tempSettings.autoSelect}
                            />
                        </SettingItem>
                        <SettingItem
                            name='Autoselect Match Margin'
                            description='Only autoselect if the best match has at least this match % more than the second best match'
                        >
                            <NumericStepper
                                value={tempSettings.autoSelectConfig.matchMarginThreshold}
                                onChange={(value) => onAutoSelectConfigChange('matchMarginThreshold', value)}
                                name='matchMarginThresholdStepper'
                                step={5}
                                min={0}
                                max={100}
                                disabled={!tempSettings.autoSelect}
                            />
                        </SettingItem>
                        <SettingItem
                            name='Autoselect Notification Time (s)'
                        >
                            <NumericStepper
                                value={tempSettings.autoSelectConfig.autoSelectNotificationDuration}
                                onChange={(value) => onAutoSelectConfigChange('autoSelectNotificationDuration', value)}
                                name='notificationDurationStepper'
                                step={1}
                                min={0}
                                max={60}
                                disabled={!tempSettings.autoSelect}
                            />
                        </SettingItem>
                    </>
                );

            default:
                return null;
        }
    };

    return <>{renderTabContent()}</>;
};

export default SettingsContent;
