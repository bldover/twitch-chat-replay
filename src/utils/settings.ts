import { BadgeOptions } from './badges'

export type Theme = 'ttv' | 'midnight';

export const THEME_OPTIONS: Theme[] = [
    'ttv',
    'midnight'
]

export const CHAT_POSITION_OPTIONS = [
    'auto',
    'right',
    'left',
    'top',
    'bottom'
] as const

export type ChatPosition = typeof CHAT_POSITION_OPTIONS[number]

export interface AutoSelectConfig {
    minMatchThreshold: number
    matchMarginThreshold: number
    autoSelectNotificationDuration: number
}

export interface AppSettings {
    autoSearch: boolean
    autoSelect: boolean
    chatPosition: ChatPosition
    chatDelay: number
    chatWidth: number
    chatHeight: number
    theme: Theme
    badges: BadgeOptions
    autoSelectConfig: AutoSelectConfig
}

const DEFAULT_SETTINGS: AppSettings = {
    autoSearch: true,
    autoSelect: false,
    chatPosition: 'right',
    chatDelay: 0,
    chatWidth: 350,
    chatHeight: 550,
    theme: 'ttv',
    badges: {
        showUserStates: true,
        showDonations: true,
        showSubTiers: true,
        showPredictions: true,
        showEvents: true
    },
    autoSelectConfig: {
        minMatchThreshold: 40,
        matchMarginThreshold: 15,
        autoSelectNotificationDuration: 5
    }
}

const SETTINGS_KEY = 'twitch-chat-replay-settings'

export const getStoredSettings = (): AppSettings => {
    try {
        const stored = localStorage.getItem(SETTINGS_KEY)
        if (stored) {
            const parsed = JSON.parse(stored)
            return { ...DEFAULT_SETTINGS, ...parsed }
        }
    } catch (error) {
        console.warn('Failed to load settings from localStorage:', error)
    }
    return DEFAULT_SETTINGS
}

export const storeSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]): void => {
    try {
        const currentSettings = getStoredSettings()
        const newSettings = { ...currentSettings, [key]: value }
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings))
    } catch (error) {
        console.warn('Failed to save settings to localStorage:', error)
    }
}

export const getThemeDisplayName = (theme: Theme): string => {
    switch (theme) {
        case 'ttv':
            return 'Twitch'
        case 'midnight':
            return 'Midnight'
        default:
            return 'Twitch'
    }
}

export const getChatPositionName = (position: ChatPosition): string => {
    switch (position) {
        case 'auto':
            return 'Auto'
        case 'right':
            return 'Right'
        case 'left':
            return 'Left'
        case 'top':
            return 'Top'
        case 'bottom':
            return 'Bottom'
        default:
            return 'Right'
    }
}
