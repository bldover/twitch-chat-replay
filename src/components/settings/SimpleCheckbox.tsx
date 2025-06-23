import './SimpleCheckbox.css';
import { FC } from 'react';

interface ToggleSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    name: string;
}

const SimpleCheckbox: FC<ToggleSwitchProps> = ({ checked, onChange, disabled = false, name }) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.checked);
    };

    return (
        <div className='checkbox-container'>
            <input
                type='checkbox'
                checked={checked}
                onChange={handleChange}
                disabled={disabled}
                name={name}
            />
        </div>
    );
};

export default SimpleCheckbox;
