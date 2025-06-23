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
    actualPosition: ChatPosition;
    isAutoMode: boolean;
}

export const useChatPosition = (): UseChatPositionReturn => {
    const { settings, updateChatPosition, updateChatWidth, updateChatHeight } = useSettings();
    const [isResizing, setIsResizing] = useState<boolean>(false);
    const [windowDimensions, setWindowDimensions] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    const isAutoMode = settings.chatPosition === 'auto';
    const isVerticalScreen = windowDimensions.width < (windowDimensions.height * 3 / 4);
    const actualPosition: ChatPosition = isAutoMode ? (isVerticalScreen ? 'bottom' : 'right') : settings.chatPosition;
    const actualWidth = isAutoMode ? (isVerticalScreen ? windowDimensions.width : 350) : settings.chatWidth;
    const calculatedHeight = isVerticalScreen ? windowDimensions.height - (windowDimensions.width / (16 / 9)) : windowDimensions.height;
    const actualHeight = isAutoMode ? Math.max(350, calculatedHeight) : settings.chatHeight;

    useEffect(() => {
        document.documentElement.style.setProperty('--chat-width', `${actualWidth}px`);
        document.documentElement.style.setProperty('--chat-height', `${actualHeight}px`);
    }, [actualWidth, actualHeight]);

    useEffect(() => {
        if (isAutoMode) {
            const handleResize = () => {
                setWindowDimensions({
                    width: window.innerWidth,
                    height: window.innerHeight
                });
            };

            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, [isAutoMode]);


    const startResize = useCallback(() => {
        setIsResizing(true);
        if (isAutoMode) {
            updateChatPosition(actualPosition);
        }
    }, [isAutoMode, actualPosition, updateChatPosition]);

    const endResize = useCallback(() => {
        setIsResizing(false);
    }, []);

    const getLayoutClass = useCallback((): string => {
        const positionToUse = isAutoMode ? actualPosition : settings.chatPosition;
        switch (positionToUse) {
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
    }, [settings.chatPosition, isAutoMode, actualPosition]);

    return {
        position: settings.chatPosition,
        width: actualWidth,
        height: actualHeight,
        isResizing,
        updatePosition: updateChatPosition,
        updateWidth: updateChatWidth,
        updateHeight: updateChatHeight,
        startResize,
        endResize,
        getLayoutClass,
        actualPosition,
        isAutoMode
    };
};
