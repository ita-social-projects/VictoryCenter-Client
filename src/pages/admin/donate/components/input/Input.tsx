import { useState } from 'react';
import './Input.scss';

interface InputProps {
    label?: string;
    placeholder?: string;
    isTitle?: boolean;
    prefix?: string;
    name: string;
    handleChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleBlur?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const Input = ({
    label,
    placeholder = 'Введіть назву',
    isTitle = false,
    prefix = '',
    name,
    handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        if (!newValue.startsWith(prefix)) {
            setValue(prefix);
        } else {
            setValue(newValue);
        }
    },
    handleBlur,
}: InputProps) => {
    const [value, setValue] = useState(prefix);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;

        if (!newValue.startsWith(prefix)) {
            setValue(prefix);
        } else {
            setValue(newValue);
        }

        if (handleChange) {
            handleChange(e);
        }
    };

    const handleClear = () => {
        setValue(prefix);
    };

    const showClearButton = value !== prefix;
    return (
        <div className={`input ${isTitle ? 'input-title' : ''}`}>
            {isTitle ? (
                <>
                    <div className="input-title-label">{label}</div>
                    <div className="input-title-body">
                        <input
                            name={name}
                            type="text"
                            placeholder={placeholder}
                            value={value}
                            onChange={onChange}
                            onBlur={handleBlur}
                        />
                        {showClearButton && <button type="button" onClick={handleClear}></button>}
                    </div>
                </>
            ) : (
                <>
                    <div className="input-label">{label}</div>
                    <div className="input-body">
                        <input
                            name={name}
                            type="text"
                            placeholder={placeholder}
                            value={value}
                            onChange={onChange}
                            onBlur={handleBlur}
                        />
                        {showClearButton && <button type="button" onClick={handleClear}></button>}
                    </div>
                </>
            )}
        </div>
    );
};
