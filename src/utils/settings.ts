export const CHAT_SELECTION_OPTIONS = [
    'manual',
    'automatic-search', 
    'automatic-selection'
] as const

export type ChatSelectionMode = typeof CHAT_SELECTION_OPTIONS[number]

export interface AppSettings {
    chatSelection: number
}

const DEFAULT_SETTINGS: AppSettings = {
    chatSelection: 0 // Default to 'manual'
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
    const index = settings.chatSelection
    return CHAT_SELECTION_OPTIONS[index] || CHAT_SELECTION_OPTIONS[0]
}

export const setChatSelectionMode = (index: number): void => {
    if (index >= 0 && index < CHAT_SELECTION_OPTIONS.length) {
        setSetting('chatSelection', index)
    }
}

export const getChatSelectionIndex = (): number => {
    return getSettings().chatSelection
}