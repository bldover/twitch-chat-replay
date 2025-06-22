import { Theme } from '../types'
import { BadgeSettings } from './badges'

export const CHAT_SELECTION_OPTIONS = [
    'manual',
    'auto-search',
    'auto-select'
] as const

export const THEME_OPTIONS: Theme[] = [
    'ttv',
    'midnight'
]

export const CHAT_POSITION_OPTIONS = [
    'right',
    'left',
    'top',
    'bottom'
] as const

export type ChatSelectionMode = typeof CHAT_SELECTION_OPTIONS[number]
export type ChatPosition = typeof CHAT_POSITION_OPTIONS[number]

export interface AutoSelectConfig {
    minMatchThreshold: number
    matchMarginThreshold: number
    autoSelectNotificationDuration: number
}

export interface AppSettings {
    chatSelection: ChatSelectionMode
    chatPosition: ChatPosition
    chatDelay: number
    chatWidth: number
    chatHeight: number
    theme: Theme
    badges: BadgeSettings
    autoSelectConfig: AutoSelectConfig
}

const DEFAULT_SETTINGS: AppSettings = {
    chatSelection: 'manual',
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

export const getSettings = (): AppSettings => {
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

export const setSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]): void => {
    try {
        const currentSettings = getSettings()
        const newSettings = { ...currentSettings, [key]: value }
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings))
    } catch (error) {
        console.warn('Failed to save settings to localStorage:', error)
    }
}

export const getChatSelectionMode = (): ChatSelectionMode => {
    const settings = getSettings()
    return settings.chatSelection
}

export const setChatSelectionMode = (mode: ChatSelectionMode): void => {
    setSetting('chatSelection', mode)
}

export const getChatDelay = (): number => {
    const settings = getSettings()
    return settings.chatDelay
}

export const setChatDelay = (delay: number): void => {
    setSetting('chatDelay', delay)
}

export const getTheme = (): Theme => {
    const settings = getSettings()
    return settings.theme
}

export const setTheme = (theme: Theme): void => {
    setSetting('theme', theme)
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

export const getBadgeSettings = (): BadgeSettings => {
    const settings = getSettings()
    return settings.badges
}

export const setBadgeSettings = (badges: BadgeSettings): void => {
    setSetting('badges', badges)
}

export const getAutoSelectConfig = (): AutoSelectConfig => {
    const settings = getSettings()
    return settings.autoSelectConfig
}

export const setAutoSelectConfig = (config: AutoSelectConfig): void => {
    setSetting('autoSelectConfig', config)
}

export const getChatPositionSetting = (): ChatPosition => {
    const settings = getSettings()
    return settings.chatPosition
}

export const setChatPositionSetting = (position: ChatPosition): void => {
    setSetting('chatPosition', position)
}

export const getChatPositionDisplayName = (position: ChatPosition): string => {
    switch (position) {
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

export const getChatWidthSetting = (): number => {
    const settings = getSettings()
    return settings.chatWidth
}

export const setChatWidthSetting = (width: number): void => {
    setSetting('chatWidth', width)
}

export const getChatHeightSetting = (): number => {
    const settings = getSettings()
    return settings.chatHeight
}

export const setChatHeightSetting = (height: number): void => {
    setSetting('chatHeight', height)
}
