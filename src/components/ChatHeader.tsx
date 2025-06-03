import './ChatHeader.css';
import { FC, useRef } from 'react';
import { ChatData } from '../types';
import { SettingsIcon, UploadIcon, CloseIcon, ArrowDownIcon, ArrowUpIcon } from './Icons';

interface ChatHeaderProps {
    hasMessages: boolean;
    isHeaderMinimized: boolean;
    searchFilter: string;
    onMinimizeHeader: () => void;
    onExpandHeader: () => void;
    onSettingsClick: () => void;
    onSearchFilterChange?: (filter: string) => void;
    onUploadCustomVod: (json: ChatData) => void;
    resetFunction: () => void;
}

const ChatHeader: FC<ChatHeaderProps> = ({
    hasMessages,
    isHeaderMinimized,
    searchFilter,
    onMinimizeHeader,
    onExpandHeader,
    onSettingsClick,
    onSearchFilterChange,
    onUploadCustomVod,
    resetFunction
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const showHeader = !hasMessages || !isHeaderMinimized;

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (onSearchFilterChange) {
            onSearchFilterChange(event.target.value);
        }
    };

    const handleSearchClick = (event: React.MouseEvent<HTMLInputElement>) => {
        const target = event.target as HTMLInputElement;
        if (target.value === 'Search for NL vods here!') {
            target.value = '';
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
            reader.readAsText(file);
        })
            .then((result) => onUploadCustomVod(JSON.parse(result)))
            .catch((error) => console.log(error));
    };

    return (
        <>
            {showHeader && (
                <div className='chat-header'>
                    <div className='header-left'>
                        {!hasMessages && (
                            <>
                                <input
                                    className='header-search'
                                    placeholder='Search for NL vods here!'
                                    value={searchFilter}
                                    onChange={handleSearchChange}
                                    onClick={handleSearchClick}
                                />
                                <button
                                    className='header-btn'
                                    onClick={handleUploadClick}
                                    title='Upload chat file'
                                >
                                    <UploadIcon />
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type='file'
                                    accept='.json'
                                    style={{ display: 'none' }}
                                    onChange={handleFileUpload}
                                />
                            </>
                        )}
                    </div>
                    <div className='header-right'>
                        <button className='header-btn' onClick={onSettingsClick} title='Settings'>
                            <SettingsIcon />
                        </button>
                        {hasMessages && (
                            <button className='header-btn' onClick={onMinimizeHeader} title='Minimize header'>
                                <ArrowUpIcon />
                            </button>
                        )}
                        <button className='header-btn header-btn-close' onClick={resetFunction} title='Close'>
                            <CloseIcon />
                        </button>
                    </div>
                </div>
            )}

            {hasMessages && isHeaderMinimized && (
                <button className='header-btn expand-header-btn' onClick={onExpandHeader} title='Show header'>
                    <ArrowDownIcon />
                </button>
            )}
        </>
    );
};

export default ChatHeader;
