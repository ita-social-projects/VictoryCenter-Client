import { ChangeEvent } from 'react';
import styles from './Toggle.module.scss';

interface ToggleProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
    id?: string;
    name?: string;
    className?: string;
    ariaLabel?: string;
    ariaLabelledBy?: string;
}

export const Toggle = ({
    checked,
    onChange,
    disabled = false,
    id,
    name,
    className = '',
    ariaLabel,
    ariaLabelledBy,
}: ToggleProps) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (disabled) return;

        onChange(e.target.checked);
    };

    return (
        <label className={`${styles.wrapper} ${disabled ? styles.disabled : ''} ${className}`} htmlFor={id}>
            <input
                id={id}
                name={name}
                type="checkbox"
                className={styles.input}
                checked={checked}
                onChange={handleChange}
                disabled={disabled}
                role="switch"
                aria-checked={checked}
                aria-label={ariaLabel}
                aria-labelledby={ariaLabelledBy}
            />
            <span className={`${styles.track} ${checked ? styles.checked : ''}`}>
                <span className={styles.thumb} />
            </span>
        </label>
    );
};
