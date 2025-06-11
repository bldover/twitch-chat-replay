import './DropdownSelector.css';
import { FC, useState, useRef, useEffect } from 'react';
import { SelectArrowDownIcon } from '../common/Icons';

interface DropdownSelectorProps {
    value: string;
    onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
    name: string;
    options: { value: string; label: string }[];
    className?: string;
}

const DropdownSelector: FC<DropdownSelectorProps> = ({
    value,
    onChange,
    name,
    options,
    className = ''
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(option => option.value === value);
    const selectedLabel = selectedOption ? selectedOption.label : '';

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleExpanded();
        }
    };

    const handleOptionClick = (optionValue: string) => {
        const syntheticEvent = {
            target: { value: optionValue, name }
        } as React.ChangeEvent<HTMLSelectElement>;
        onChange(syntheticEvent);
        setIsExpanded(false);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsExpanded(false);
            }
        };

        if (isExpanded) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isExpanded]);

    return (
        <div className={`dropdown-selector-container ${className}`.trim()} ref={containerRef}>
            <div 
                className='dropdown-selector-trigger' 
                onClick={toggleExpanded} 
                onKeyDown={handleKeyDown} 
                tabIndex={0}
            >
                <span className='dropdown-selector-value'>{selectedLabel}</span>
                <span className={`dropdown-selector-arrow ${isExpanded ? 'expanded' : ''}`}>
                    <SelectArrowDownIcon />
                </span>
            </div>

            {isExpanded && (
                <div className='dropdown-selector-content'>
                    {options.map((option) => (
                        <div
                            key={option.value}
                            className={`dropdown-selector-option ${option.value === value ? 'selected' : ''}`}
                            onClick={() => handleOptionClick(option.value)}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DropdownSelector;
