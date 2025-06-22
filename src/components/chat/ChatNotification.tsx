import './ChatNotification.css';
import { FC, useEffect, useState } from 'react';

export type NotificationType = 'info' | 'error';

interface ChatNotificationProps {
    message: string;
    details?: string;
    type?: NotificationType;
}

const ChatNotification: FC<ChatNotificationProps> = ({
    message,
    details,
    type = 'info'
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const fadeInTimer = setTimeout(() => {
            setIsVisible(true);
        }, 10);

        return () => {
            clearTimeout(fadeInTimer);
        };
    }, []);

    return (
        <div className={`chat-notification ${isVisible ? 'visible' : ''}`}>
            <div className={`chat-notification-message chat-notification-${type}`} > {message}</div>
            {details && <div className='chat-notification-details'>{details}</div>}
        </div >
    );
};

export default ChatNotification;
