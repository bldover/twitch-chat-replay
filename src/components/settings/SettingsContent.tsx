import { FC } from 'react';
import { CHAT_POSITION_OPTIONS, THEME_OPTIONS, getThemeDisplayName, getChatPositionName, AutoSelectConfig, AppSettings } from '../../utils/settings';
import { BadgeOptions as BadgeSettingsType } from '../../utils/badges';
import BadgeSettings from './BadgeSettings';
import SettingItem from './SettingItem';
import NumericStepper from './NumericStepper';
import DropdownSelector from './DropdownSelector';
import SimpleCheckbox from './SimpleCheckbox';
import SettingsSection from './SettingsSection';

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
                    <SettingsSection title="Display">
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
                            />
                        </SettingItem>
                    </SettingsSection>
                );

            case 'behavior':
                return (
                    <SettingsSection title="Chat Behavior">
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
                            showGlow={false}
                        >
                            <BadgeSettings
                                value={tempSettings.badges}
                                onChange={onBadgeToggle}
                            />
                        </SettingItem>
                    </SettingsSection>
                );

            case 'selection':
                return (
                    <SettingsSection
                        title='Chat Selection'
                        description='Chats are available for VODs since 2016. The YT titles are usually edited versions of the VOD title, so it is often possible to match the video title to the right VOD'
                    >
                        <SettingItem
                            name='Auto Search'
                            description='Identify and rank chats similar to the selected video title'
                            showGlow={false}
                        >
                            <SimpleCheckbox
                                checked={tempSettings.autoSearch}
                                onChange={onAutoSearchToggle}
                                name='autoSearchToggle'
                            />
                        </SettingItem>
                        <SettingItem
                            name='Auto Select'
                            description='Select the best matching chat if the below criteria are met. Works for most series'
                            showGlow={false}
                        >
                            <SimpleCheckbox
                                checked={tempSettings.autoSelect}
                                onChange={onAutoSelectToggle}
                                name='autoSelectToggle'
                            />
                        </SettingItem>
                        <SettingItem
                            name='Min Match Threshold'
                            description='Minimum match percentage required for automatic selection'
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
                            name='Min Match Margin'
                            description='Minimum gap between first and second best match'
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
                            name='Notification Time (s)'
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
                    </SettingsSection>
                );

            default:
                return null;
        }
    };

    return <>{renderTabContent()}</>;
};

export default SettingsContent;
