import './EmoteTypeManager.css';
import { FC, useRef } from 'react';
import { EmoteSource } from '../../types';
import { EmoteTypeSettings } from '../../utils/settings';
import SimpleCheckbox from './SimpleCheckbox';
import DropdownSelector from './DropdownSelector';

interface EmoteTypeManagerProps {
    emoteType: EmoteSource;
    emoteTypeName: string;
    settings: EmoteTypeSettings;
    onEnabledToggle: (emoteType: EmoteSource, enabled: boolean) => void;
    onFileSelect: (emoteType: EmoteSource, fileId: string) => void;
    onFileAdd: (emoteType: EmoteSource, file: File) => Promise<void>;
    onFileDelete: (emoteType: EmoteSource, fileId: string) => void;
}

const EmoteTypeManager: FC<EmoteTypeManagerProps> = ({
    emoteType,
    emoteTypeName,
    settings,
    onEnabledToggle,
    onFileSelect,
    onFileAdd,
    onFileDelete
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleEnabledChange = (checked: boolean) => {
        onEnabledToggle(emoteType, checked);
    };

    const handleFileSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        onFileSelect(emoteType, event.target.value);
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileInputChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                await onFileAdd(emoteType, file);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } catch (error) {
                console.error('Error adding emote file:', error);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            }
        }
    };

    const handleDeleteClick = () => {
        if (settings.selectedFileId) {
            onFileDelete(emoteType, settings.selectedFileId);
        }
    };

    const selectedFile = settings.files.find(f => f.id === settings.selectedFileId);
    const canDelete = selectedFile && !selectedFile.isBuiltIn;

    const dropdownOptions = settings.files.length > 0
        ? settings.files.map(file => ({
            value: file.id,
            label: file.fileName
        }))
        : [{ value: '', label: 'None Available' }];

    const dropdownValue = settings.selectedFileId || '';

    return (
        <div className='emote-type-manager'>
            <div className='emote-type-manager-header'>
                <SimpleCheckbox
                    checked={settings.enabled}
                    onChange={handleEnabledChange}
                    name={`${emoteType}-enabled`}
                />
                <span className='emote-type-name'>{emoteTypeName}</span>
            </div>

            <div className='emote-type-manager-controls'>
                <DropdownSelector
                    value={dropdownValue}
                    onChange={handleFileSelectChange}
                    name={`${emoteType}-file-selector`}
                    options={dropdownOptions}
                    className='emote-file-dropdown'
                />
                <button
                    className='emote-manager-button'
                    onClick={handleBrowseClick}
                    disabled={!settings.enabled}
                >
                    Browse
                </button>
                <button
                    className='emote-manager-button'
                    onClick={handleDeleteClick}
                    disabled={!settings.enabled || !canDelete}
                >
                    Delete
                </button>
                <input
                    ref={fileInputRef}
                    type='file'
                    accept='.json'
                    onChange={handleFileInputChange}
                    style={{ display: 'none' }}
                />
            </div>
        </div>
    );
};

export default EmoteTypeManager;
