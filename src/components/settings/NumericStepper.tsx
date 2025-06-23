import { MinusIcon, PlusIcon } from '../common/Icons';
import './NumericStepper.css';
import { FC, useState, useEffect } from 'react';

interface NumericStepperProps {
    value: number;
    onChange: (value: number) => void;
    name: string;
    step?: number;
    placeholder?: string;
    min?: number;
    max?: number;
    disabled?: boolean;
}

const NumericStepper: FC<NumericStepperProps> = ({
    value,
    onChange,
    name,
    step = 1,
    placeholder,
    min,
    max,
    disabled = false
}) => {
    const [displayValue, setDisplayValue] = useState<string>(value.toString());

    const clampValue = (val: number): number => {
        if (min !== undefined && val < min) return min;
        if (max !== undefined && val > max) return max;
        return val;
    };

    useEffect(() => {
        setDisplayValue(value.toString());
    }, [value]);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const inputValue = event.target.value;
        setDisplayValue(inputValue);

        if (inputValue === '') {
            return;
        }

        const newValue = parseFloat(inputValue);
        if (!isNaN(newValue)) {
            const clampedValue = clampValue(newValue);
            onChange(clampedValue);
        }
    };

    const handleBlur = () => {
        if (displayValue === '' || isNaN(parseFloat(displayValue))) {
            const defaultValue = clampValue(0);
            setDisplayValue(defaultValue.toString());
            onChange(defaultValue);
        } else {
            const numValue = parseFloat(displayValue);
            const clampedValue = clampValue(numValue);
            setDisplayValue(clampedValue.toString());
            onChange(clampedValue);
        }
    };

    const increment = () => {
        const newValue = clampValue(value + step);
        onChange(newValue);
        setDisplayValue(newValue.toString());
    };

    const decrement = () => {
        const newValue = clampValue(value - step);
        onChange(newValue);
        setDisplayValue(newValue.toString());
    };

    return (
        <div className={`numeric-stepper-container ${disabled ? 'numeric-stepper-disabled' : ''}`}>
            <input
                type='number'
                name={name}
                step={step}
                min={min}
                max={max}
                className='numeric-stepper'
                value={displayValue}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder={placeholder}
                disabled={disabled}
            />
            <button
                type='button'
                className='numeric-stepper-button minus'
                onClick={decrement}
                disabled={disabled}
            >
                <MinusIcon className='numeric-stepper-icon' />
            </button>
            <button
                type='button'
                className='numeric-stepper-button plus'
                onClick={increment}
                disabled={disabled}
            >
                <PlusIcon className='numeric-stepper-icon' />
            </button>
        </div>
    );
};

export default NumericStepper;
