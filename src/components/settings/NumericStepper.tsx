import { MinusIcon, PlusIcon } from '../common/Icons';
import './NumericStepper.css';
import { FC, useState, useEffect } from 'react';

interface NumericStepperProps {
    value: number;
    onChange: (value: number) => void;
    name: string;
    step?: number;
    placeholder?: string;
}

const NumericStepper: FC<NumericStepperProps> = ({
    value,
    onChange,
    name,
    step = 1,
    placeholder
}) => {
    const [displayValue, setDisplayValue] = useState<string>(value.toString());

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
            onChange(newValue);
        }
    };

    const handleBlur = () => {
        if (displayValue === '' || isNaN(parseFloat(displayValue))) {
            setDisplayValue('0');
            onChange(0);
        } else {
            const numValue = parseFloat(displayValue);
            setDisplayValue(numValue.toString());
            onChange(numValue);
        }
    };

    const increment = () => {
        const newValue = value + step;
        onChange(newValue);
        setDisplayValue(newValue.toString());
    };

    const decrement = () => {
        const newValue = value - step;
        onChange(newValue);
        setDisplayValue(newValue.toString());
    };

    return (
        <div className={'numeric-stepper-container'}>
            <input
                type='number'
                name={name}
                step={step}
                className='numeric-stepper'
                value={displayValue}
                onChange={handleInputChange}
                onBlur={handleBlur}
                placeholder={placeholder}
            />
            <button
                type='button'
                className='numeric-stepper-button minus'
                onClick={decrement}
            >
                <MinusIcon className='numeric-stepper-icon' />
            </button>
            <button
                type='button'
                className='numeric-stepper-button plus'
                onClick={increment}
            >
                <PlusIcon className='numeric-stepper-icon' />
            </button>
        </div>
    );
};

export default NumericStepper;
