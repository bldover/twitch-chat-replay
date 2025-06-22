import { useState, useEffect, useCallback } from 'react';
import { ChatPosition } from '../types';
import { 
    getChatPositionSetting, 
    getChatWidthSetting, 
    getChatHeightSetting,
    setChatPositionSetting,
    setChatWidthSetting,
    setChatHeightSetting 
} from '../utils/settings';

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
    const [position, setPosition] = useState<ChatPosition>(getChatPositionSetting());
    const [width, setWidth] = useState<number>(getChatWidthSetting());
    const [height, setHeight] = useState<number>(getChatHeightSetting());
    const [isResizing, setIsResizing] = useState<boolean>(false);

    useEffect(() => {
        document.documentElement.style.setProperty('--chat-width', `${width}px`);
        document.documentElement.style.setProperty('--chat-height', `${height}px`);
    }, [width, height]);

    const updatePosition = useCallback((newPosition: ChatPosition) => {
        setPosition(newPosition);
        setChatPositionSetting(newPosition);
    }, []);

    const updateWidth = useCallback((newWidth: number) => {
        setWidth(newWidth);
        setChatWidthSetting(newWidth);
    }, []);

    const updateHeight = useCallback((newHeight: number) => {
        setHeight(newHeight);
        setChatHeightSetting(newHeight);
    }, []);

    const startResize = useCallback(() => {
        setIsResizing(true);
    }, []);

    const endResize = useCallback(() => {
        setIsResizing(false);
    }, []);

    const getLayoutClass = useCallback((): string => {
        switch (position) {
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
    }, [position]);

    return {
        position,
        width,
        height,
        isResizing,
        updatePosition,
        updateWidth,
        updateHeight,
        startResize,
        endResize,
        getLayoutClass
    };
};