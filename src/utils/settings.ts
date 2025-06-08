import { Theme } from '../types'

export const CHAT_SELECTION_OPTIONS = [
    'manual',
    'automatic-search',
    'automatic-selection'
] as const

export const THEME_OPTIONS: Theme[] = [
    'ttv',
    'midnight',
    'light'
]

export type ChatSelectionMode = typeof CHAT_SELECTION_OPTIONS[number]

export interface AppSettings {
    chatSelection: ChatSelectionMode
    chatDelay: number
    theme: Theme
}

const DEFAULT_SETTINGS: AppSettings = {
    chatSelection: 'manual',
    chatDelay: 0,
    theme: 'ttv'
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
            return 'Twitch TV'
        case 'midnight':
            return 'Midnight'
        case 'light':
            return 'Light'
        default:
            return 'Dark'
    }
}
