import './ResizeHandle.css';
import { FC, useRef, useCallback } from 'react';
import { ChatPosition } from '../../utils/settings';

interface ResizeHandleProps {
    chatPosition: ChatPosition;
    currentWidth: number;
    currentHeight: number;
    onWidthChange: (width: number) => void;
    onHeightChange: (height: number) => void;
    onDragStart: () => void;
    onDragEnd: () => void;
    isAutoMode?: boolean;
}

const ResizeHandle: FC<ResizeHandleProps> = ({
    chatPosition,
    currentWidth,
    currentHeight,
    onWidthChange,
    onHeightChange,
    onDragStart,
    onDragEnd,
    isAutoMode = false
}) => {
    const isDragginRef = useRef(false);
    const startPositionRef = useRef({ x: 0, y: 0 });
    const startSizeRef = useRef({ width: 0, height: 0 });

    const isHorizontalPosition = chatPosition === 'left' || chatPosition === 'right';
    const minSize = 350;
    const maxWidthRatio = 0.8;
    const maxHeightRatio = 0.8;

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragginRef.current) return;

        const deltaX = e.clientX - startPositionRef.current.x;
        const deltaY = e.clientY - startPositionRef.current.y;

        if (isHorizontalPosition) {
            let newWidth;
            if (chatPosition === 'right') {
                newWidth = startSizeRef.current.width - deltaX;
            } else {
                newWidth = startSizeRef.current.width + deltaX;
            }

            const maxWidth = Math.floor(window.innerWidth * maxWidthRatio);
            newWidth = Math.max(minSize, Math.min(maxWidth, newWidth));
            onWidthChange(newWidth);
        } else {
            let newHeight;
            if (chatPosition === 'bottom') {
                newHeight = startSizeRef.current.height - deltaY;
            } else {
                newHeight = startSizeRef.current.height + deltaY;
            }

            const maxHeight = Math.floor(window.innerHeight * maxHeightRatio);
            newHeight = Math.max(minSize, Math.min(maxHeight, newHeight));
            onHeightChange(newHeight);
        }
    }, [isHorizontalPosition, chatPosition, onWidthChange, onHeightChange]);

    const handleMouseUp = useCallback(() => {
        isDragginRef.current = false;
        onDragEnd();
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
    }, [onDragEnd, handleMouseMove]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        isDragginRef.current = true;
        startPositionRef.current = { x: e.clientX, y: e.clientY };
        startSizeRef.current = { width: currentWidth, height: currentHeight };

        onDragStart();
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    }, [currentWidth, currentHeight, handleMouseMove, handleMouseUp, onDragStart]);

    const getHandleClass = () => {
        switch (chatPosition) {
            case 'right':
                return 'resize-handle resize-handle-left';
            case 'left':
                return 'resize-handle resize-handle-right';
            case 'top':
                return 'resize-handle resize-handle-bottom';
            case 'bottom':
                return 'resize-handle resize-handle-top';
            default:
                return 'resize-handle resize-handle-right';
        }
    };

    return (
        <div
            className={getHandleClass()}
            onMouseDown={handleMouseDown}
        />
    );
};

export default ResizeHandle;
