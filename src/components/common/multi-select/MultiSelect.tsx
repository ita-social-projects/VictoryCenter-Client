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

export const MultiSelect = <T extends Record<string, any>>(props: MultiselectProps<T>) => {
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
            return optionId != null && selectedIds.has(optionId);
        },
        [selectedIds, getOptionId],
    );

    const toggleOption = useCallback(
        (optionValue: T) => {
            if (disabled) return;
            const optionId = getOptionId(optionValue);
            if (optionId == null) return;

            const exists = selectedIds.has(optionId);
            const newSelectedValues = exists
                ? value.filter((v) => getOptionId(v) !== optionId)
                : [...value, optionValue];
            onChange?.(newSelectedValues);
        },
        [value, selectedIds, getOptionId, onChange, disabled],
    );

    const toggleDropdown = useCallback(() => {
        if (disabled) return;
        setIsOpen((prev) => !prev);
    }, [disabled]);

    const handleOptionKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, option: T) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleOption(option);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
                onBlur?.();
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
        return joinedNames.length > 50 ? `${names.slice(0, 2).join(', ')}...` : joinedNames;
    }, [value, getOptionName, placeholder]);

    return (
        <div className="multiselect" ref={containerRef}>
            <button
                type="button"
                className={classNames('multiselect-placeholder-container', {
                    'multiselect-placeholder-container-selected': isOpen,
                    'multiselect-placeholder-container-disabled': disabled,
                })}
                onClick={toggleDropdown}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
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
            </button>

            {isOpen && !disabled && (
                <div className="multiselect-options-container" role="listbox" aria-multiselectable="true">
                    {options.map((option) => {
                        const selected = isSelected(option);
                        const optionId = getOptionId(option);
                        return (
                            <div
                                key={optionId}
                                className={classNames('option', { 'option-selected': selected })}
                                onClick={() => toggleOption(option)}
                                onKeyDown={(e) => handleOptionKeyDown(e, option)}
                                role="option"
                                aria-selected={selected}
                                tabIndex={0}
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
