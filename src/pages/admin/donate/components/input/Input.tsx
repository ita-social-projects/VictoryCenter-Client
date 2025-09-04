import { useEffect, useState } from 'react';
import './Input.scss';

interface InputProps {
    label?: string;
    placeholder?: string;
    isTitle?: boolean;
    prefix?: string;
    name: string;
    value?: string;
    editable?: boolean;
    handleChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleBlur?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    className?: string;
}

export const Input = ({
    label,
    placeholder = 'Введіть назву',
    isTitle = false,
    prefix = '',
    name,
    value: externalValue,
    editable = true,
    handleChange,
    handleBlur,
    className,
}: InputProps) => {
    const [value, setValue] = useState(prefix);
    const [initialValue, setInitialValue] = useState(prefix);
    const [hasEdited, setHasEdited] = useState(false);

    useEffect(() => {
        if (externalValue !== undefined && externalValue !== null) {
            const newValue = prefix + externalValue.replace(prefix, '');
            setValue(newValue);
            setInitialValue(newValue);
        } else {
            setValue(prefix);
            setInitialValue(prefix);
        }
    }, [externalValue, prefix]);

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;

        if (!newValue.startsWith(prefix)) {
            setValue(prefix);
        } else {
            setValue(newValue);
        }

        if (!hasEdited && newValue !== initialValue) {
            setHasEdited(true);
        }

        if (handleChange) {
            handleChange(e);
        }
    };

    const handleClear = () => {
        setValue(prefix);
        setHasEdited(true);
    };

    const showClearButton = editable && hasEdited && value.length > prefix.length;
    return (
        <div className={`input ${isTitle ? 'input-title' : ''} ${hasEdited ? 'input-changed' : ''} ${className ?? ''}`}>
            {isTitle ? (
                <>
                    {label && <div className="input-title-label">{label}</div>}
                    <div className="input-title-body">
                        <input
                            name={name}
                            type="text"
                            placeholder={placeholder}
                            value={value}
                            onChange={onChange}
                            onBlur={handleBlur}
                            readOnly={!editable}
                        />
                        {showClearButton && <button type="button" onClick={handleClear}></button>}
                    </div>
                </>
            ) : (
                <>
                    {label && <div className="input-label">{label}</div>}
                    <div className="input-body">
                        <input
                            name={name}
                            type="text"
                            placeholder={placeholder}
                            value={value}
                            onChange={onChange}
                            onBlur={handleBlur}
                            readOnly={!editable}
                        />
                        {showClearButton && <button type="button" onClick={handleClear}></button>}
                    </div>
                </>
            )}
        </div>
    );
};
