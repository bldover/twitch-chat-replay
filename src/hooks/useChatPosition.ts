import { useState, useEffect, useCallback } from 'react';
import { ChatPosition } from '../utils/settings';
import { useSettings } from '../contexts/SettingsContext';

export interface UseChatPositionReturn {
    position: ChatPosition;
    width: number;
    height: number;
    isResizing: boolean;
    updatePosition: (position: ChatPosition) => void;
    updateWidth: (width: number) => void;
    updateHeight: (height: number) => void;
    startResize: () => void;
    endResize: () => void;
    getLayoutClass: () => string;
}

export const useChatPosition = (): UseChatPositionReturn => {
    const { settings, updateChatPosition, updateChatWidth, updateChatHeight } = useSettings();
    const [isResizing, setIsResizing] = useState<boolean>(false);

    useEffect(() => {
        document.documentElement.style.setProperty('--chat-width', `${settings.chatWidth}px`);
        document.documentElement.style.setProperty('--chat-height', `${settings.chatHeight}px`);
    }, [settings.chatWidth, settings.chatHeight]);


    const startResize = useCallback(() => {
        setIsResizing(true);
    }, []);

    const endResize = useCallback(() => {
        setIsResizing(false);
    }, []);

    const getLayoutClass = useCallback((): string => {
        switch (settings.chatPosition) {
            case 'right':
                return 'layout-row';
            case 'left':
                return 'layout-row-reverse';
            case 'top':
                return 'layout-column-reverse';
            case 'bottom':
                return 'layout-column';
            default:
                return 'layout-row';
        }
    }, [settings.chatPosition]);

    return {
        position: settings.chatPosition,
        width: settings.chatWidth,
        height: settings.chatHeight,
        isResizing,
        updatePosition: updateChatPosition,
        updateWidth: updateChatWidth,
        updateHeight: updateChatHeight,
        startResize,
        endResize,
        getLayoutClass
    };
};