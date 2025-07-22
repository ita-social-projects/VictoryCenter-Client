import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import CheckedBox from '../../../assets/icons/chevron-checked.svg';
import UncheckedBox from '../../../assets/icons/chevron-unchecked.svg';
import ArrowDown from '../../../assets/icons/chevron-down.svg';
import ArrowUp from '../../../assets/icons/chevron-up.svg';
import classNames from 'classnames';
import './multi-select.scss';

interface MultiselectProps<T extends Record<string, any>> {
    options: T[];
    value?: T[];
    onChange?: (selectedValues: T[]) => void;
    onBlur?: () => void;
    getOptionId: (value: T) => string | number;
    getOptionName: (value: T) => string;
    placeholder?: string;
    disabled?: boolean;
}

const Multiselect = <T extends Record<string, any>>(props: MultiselectProps<T>) => {
    const {
        options,
        value = [],
        onChange,
        onBlur,
        getOptionId,
        getOptionName,
        placeholder = 'Select options...',
        disabled,
    } = props;

    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedIds = useMemo(() => new Set(value.map(getOptionId)), [value, getOptionId]);

    const isSelected = useCallback(
        (option: T): boolean => {
            const optionId = getOptionId(option);
            if (optionId === null || optionId === undefined) {
                console.warn('getOptionId returned null/undefined for option:', option);
                return false;
            }
            return selectedIds.has(optionId);
        },
        [selectedIds, getOptionId],
    );

    const toggleOption = useCallback(
        (optionValue: T) => {
            if (disabled) return;

            const optionId = getOptionId(optionValue);

            if (optionId === null || optionId === undefined) {
                console.warn('getOptionId returned null/undefined for option:', optionValue);
                return;
            }

            const exists = selectedIds.has(optionId);

            const newSelectedValues = exists
                ? value.filter((v) => getOptionId(v) !== optionId)
                : [...value, optionValue];

            try {
                onChange?.(newSelectedValues);
            } catch (error) {
                console.error('Error in onChange callback:', error);
            }
        },
        [value, selectedIds, getOptionId, onChange, disabled],
    );

    const toggleDropdown = useCallback(() => {
        if (disabled) return;
        setIsOpen((prev) => !prev);
    }, [disabled]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                try {
                    onBlur?.();
                } catch (error) {
                    console.error('Error in onBlur callback:', error);
                }
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isOpen, onBlur]);

    const displayLabel = useMemo(() => {
        if (value.length === 0) return placeholder;

        const names = value.map(getOptionName);
        const joinedNames = names.join(', ');

        if (joinedNames.length > 50) {
            return `${names.slice(0, 2).join(', ')}${names.length > 2 ? ` +${names.length - 2} more` : ''}`;
        }

        return joinedNames;
    }, [value, getOptionName, placeholder]);

    return (
        <div className={classNames('multiselect')} ref={containerRef}>
            <div
                className={classNames('multiselect-placeholder-container', {
                    'multiselect-placeholder-container-selected': isOpen,
                    'multiselect-placeholder-container-disabled': disabled,
                })}
                onClick={toggleDropdown}
            >
                <div
                    className={classNames('placeholder', {
                        'placeholder-selected': value.length > 0,
                    })}
                >
                    <div className="placeholder-content">{displayLabel}</div>
                    <div className="placeholder-chevron">
                        <img src={isOpen ? ArrowUp : ArrowDown} alt={isOpen ? 'Collapse options' : 'Expand options'} />
                    </div>
                </div>
            </div>

            {isOpen && !disabled && (
                <div className="multiselect-options-container">
                    {options.map((option) => {
                        const selected = isSelected(option);
                        const optionId = getOptionId(option);
                        return (
                            <div
                                key={optionId}
                                className={classNames('option', {
                                    'option-selected': selected,
                                })}
                                onClick={() => toggleOption(option)}
                            >
                                <div className="checkbox">
                                    <img
                                        src={selected ? CheckedBox : UncheckedBox}
                                        alt={selected ? 'Selected' : 'Not selected'}
                                    />
                                </div>
                                <span className="option-content">{getOptionName(option)}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Multiselect;
