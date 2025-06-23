import { createContext, useContext, ReactNode, useCallback, useState, useEffect } from 'react';
import { AppSettings, getSettings, setSetting, ChatPosition, Theme, AutoSelectConfig } from '../utils/settings';
import { BadgeOptions } from '../utils/badges';

interface SettingsContextType {
    settings: AppSettings;
    updateTheme: (theme: Theme) => void;
    updateChatDelay: (delay: number) => void;
    updateBadgeSettings: (badges: BadgeOptions) => void;
    updateChatPosition: (position: ChatPosition) => void;
    updateChatWidth: (width: number) => void;
    updateChatHeight: (height: number) => void;
    updateAutoSelectConfig: (config: AutoSelectConfig) => void;
    updateSettings: (partial: Partial<AppSettings>) => void;
}

const SettingsContext = createContext<SettingsContextType | null>(null);

interface SettingsProviderProps {
    children: ReactNode;
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
    const [settings, setSettings] = useState<AppSettings>(getSettings);

    // Listen for localStorage changes from other tabs/windows
    useEffect(() => {
        const handleStorageChange = (event: StorageEvent) => {
            if (event.key === 'twitch-chat-replay-settings' && event.newValue) {
                try {
                    setSettings(JSON.parse(event.newValue));
                } catch (error) {
                    console.warn('Failed to parse settings from storage event:', error);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const updateSetting = useCallback(<K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
        setSetting(key, value);
        setSettings(prev => ({ ...prev, [key]: value }));
    }, []);

    const updateTheme = useCallback((theme: Theme) => {
        updateSetting('theme', theme);
    }, [updateSetting]);

    const updateChatDelay = useCallback((delay: number) => {
        updateSetting('chatDelay', delay);
    }, [updateSetting]);

    const updateBadgeSettings = useCallback((badges: BadgeOptions) => {
        updateSetting('badges', badges);
    }, [updateSetting]);

    const updateChatPosition = useCallback((position: ChatPosition) => {
        updateSetting('chatPosition', position);
    }, [updateSetting]);

    const updateChatWidth = useCallback((width: number) => {
        updateSetting('chatWidth', width);
    }, [updateSetting]);

    const updateChatHeight = useCallback((height: number) => {
        updateSetting('chatHeight', height);
    }, [updateSetting]);


    const updateAutoSelectConfig = useCallback((config: AutoSelectConfig) => {
        updateSetting('autoSelectConfig', config);
    }, [updateSetting]);

    const updateSettings = useCallback((partial: Partial<AppSettings>) => {
        const newSettings = { ...settings, ...partial };
        Object.entries(partial).forEach(([key, value]) => {
            setSetting(key as keyof AppSettings, value);
        });
        setSettings(newSettings);
    }, [settings]);

    return (
        <SettingsContext.Provider value={{
            settings,
            updateTheme,
            updateChatDelay,
            updateBadgeSettings,
            updateChatPosition,
            updateChatWidth,
            updateChatHeight,
            updateAutoSelectConfig,
            updateSettings
        }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = (): SettingsContextType => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};
