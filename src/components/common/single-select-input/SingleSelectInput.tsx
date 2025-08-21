import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ReactComponent as ArrowDown } from '../../../assets/icons/chevron-down.svg';
import { ReactComponent as ArrowUp } from '../../../assets/icons/chevron-up.svg';
import classNames from 'classnames';
import './SingleSelectInput.scss';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';

export interface SingleSelectInputProps<T extends Record<string, any>> {
    options: T[];
    value?: T;
    onChange?: (value: T) => void;
    onBlur?: () => void;
    getOptionId: (value: T) => string | number;
    getOptionName: (value: T) => string;
    placeholder: string;
    disabled?: boolean;
}

export const SingleSelectInput = <T extends Record<string, any>>({
    options,
    value,
    onChange,
    onBlur,
    getOptionId,
    getOptionName,
    placeholder,
    disabled = false,
}: SingleSelectInputProps<T>) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef<HTMLDivElement>(null);

    const toggleDropdown = useCallback(() => {
        if (!disabled) {
            setIsOpen((prev) => !prev);
        }
    }, [disabled]);

    const handleSelectOption = (option: T) => {
        onChange?.(option);
        setIsOpen(false);
    };

    const handleClickOutside = useCallback(
        (event: MouseEvent) => {
            if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                onBlur?.();
            }
        },
        [onBlur],
    );

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen, handleClickOutside]);

    const displayLabel = useMemo(() => {
        return value ? getOptionName(value) : placeholder;
    }, [value, getOptionName, placeholder]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, option: T) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSelectOption(option);
        }
    };

    return (
        <div
            className={classNames('singleselect', {
                'singleselect-selected': isOpen,
            })}
            ref={selectRef}
        >
            <button
                type="button"
                className={classNames('select-input', { 'select-input-disabled': disabled })}
                onClick={toggleDropdown}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <div
                    className={classNames(
                        { 'option-value': displayLabel !== placeholder },
                        { 'option-value-placeholder': displayLabel === placeholder },
                    )}
                >
                    {displayLabel}
                </div>
                <div className="placeholder-arrow">
                    {isOpen ? (
                        <ArrowUp className="icon-img" aria-label={COMMON_TEXT_ADMIN.ALT.COLLAPSE_OPTIONS_LIST} />
                    ) : (
                        <ArrowDown className="icon-img" aria-label={COMMON_TEXT_ADMIN.ALT.EXPAND_OPTIONS_LIST} />
                    )}
                </div>
            </button>

            {isOpen && !disabled && (
                <div
                    className="singleselect-options"
                    role="listbox"
                    aria-activedescendant={value ? `option-${String(getOptionId(value))}` : undefined}
                    tabIndex={0}
                >
                    {options.map((option) => {
                        const id = getOptionId(option);
                        const name = getOptionName(option);
                        const isSelected = value && getOptionId(value) === id;
                        return (
                            <div
                                key={id}
                                id={`option-${String(id)}`}
                                className={classNames('option', { 'option-selected': isSelected })}
                                onClick={() => handleSelectOption(option)}
                                onKeyDown={(e) => handleKeyDown(e, option)}
                                role="option"
                                aria-selected={isSelected}
                                tabIndex={0}
                            >
                                {name}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
