import './ExpandableChecklist.css';
import { FC, useState, useMemo, useRef, useEffect } from 'react';
import { SelectArrowDownIcon } from '../common/Icons';

export interface ChecklistOption {
    key: string;
    label: string;
    checked: boolean;
}

interface ExpandableChecklistProps {
    options: ChecklistOption[];
    onChange: (key: string) => void;
    placeholder?: string;
}

const ExpandableChecklist: FC<ExpandableChecklistProps> = ({ options, onChange }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const toggleExpanded = () => {
        setIsExpanded(!isExpanded);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleExpanded();
        }
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

    const { allChecked, noneChecked, status } = useMemo(() => {
        const checkedCount = options.filter(opt => opt.checked).length;
        const allChecked = checkedCount === options.length && options.length > 0;
        const noneChecked = checkedCount === 0;

        let status: string;
        if (allChecked) {
            status = 'All enabled';
        } else if (noneChecked) {
            status = 'All disabled';
        } else {
            status = 'Partially enabled';
        }

        return { allChecked, noneChecked, status };
    }, [options]);

    const handleSelectAllChange = () => {
        const shouldCheckAll = !allChecked;

        // Toggle all options to match the desired state
        options.forEach(option => {
            if (option.checked !== shouldCheckAll) {
                onChange(option.key);
            }
        });
    };

    const getSelectAllCheckState = () => {
        if (allChecked) return 'checked';
        if (noneChecked) return 'unchecked';
        return 'indeterminate';
    };

    return (
        <div className='expandable-checklist' ref={containerRef}>
            <div className='expandable-checklist-trigger' onClick={toggleExpanded} onKeyDown={handleKeyDown} tabIndex={0}>
                <span className='expandable-checklist-status'>{status}</span>
                <span className={`expandable-checklist-arrow ${isExpanded ? 'expanded' : ''}`}>
                    <SelectArrowDownIcon />
                </span>
            </div>

            {isExpanded && (
                <div className='expandable-checklist-content'>
                    <label className='expandable-checklist-item select-all'>
                        <div className='expandable-checklist-checkbox'>
                            <input
                                type='checkbox'
                                checked={allChecked}
                                ref={(input) => {
                                    if (input) {
                                        input.indeterminate = getSelectAllCheckState() === 'indeterminate';
                                    }
                                }}
                                onChange={handleSelectAllChange}
                            />
                        </div>
                        <div className='expandable-checklist-label'>Select All</div>
                    </label>

                    <div className='expandable-checklist-separator'></div>

                    {options.map(option => (
                        <label key={option.key} className='expandable-checklist-item'>
                            <div className='expandable-checklist-checkbox'>
                                <input
                                    type='checkbox'
                                    checked={option.checked}
                                    onChange={() => onChange(option.key)}
                                />
                            </div>
                            <div className='expandable-checklist-label'>{option.label}</div>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ExpandableChecklist;
