import './VideoOverlay.css';
import { FC } from 'react';

interface VideoOverlayProps {
    isVisible: boolean;
}

const VideoOverlay: FC<VideoOverlayProps> = ({ isVisible }) => {
    if (!isVisible) return null;

    return (
        <div className='video-overlay' />
    );
};

export default VideoOverlay;