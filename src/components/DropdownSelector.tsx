import './DropdownSelector.css';
import { FC } from 'react';
import { SelectArrowDownIcon } from './Icons';

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
    return (
        <div className={`dropdown-selector-container ${className}`.trim()}>
            <select
                className='dropdown-selector'
                value={value}
                onChange={onChange}
                name={name}
            >
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <div className='dropdown-selector-arrow'>
                <SelectArrowDownIcon className='dropdown-selector-icon' />
            </div>
        </div>
    );
};

export default DropdownSelector;
