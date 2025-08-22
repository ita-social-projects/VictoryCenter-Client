import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useOnClickOutside } from '../../../hooks/common/use-on-click-outside/useOnClickOutside';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';
import CheckedBox from '../../../assets/icons/chevron-checked.svg';
import UncheckedBox from '../../../assets/icons/chevron-unchecked.svg';
import ArrowDown from '../../../assets/icons/chevron-down.svg';
import ArrowUp from '../../../assets/icons/chevron-up.svg';
import classNames from 'classnames';
import './MultiSelectInput.scss';

export interface MultiSelectInputProps<T> {
    id: string;
    options: T[];
    value?: T[];
    getOptionId: (value: T) => string | number;
    getOptionName: (value: T) => string;
    onChange?: (selectedValues: T[]) => void;
    onBlur?: () => void;
    placeholder?: string;
    disabled?: boolean;
}

export const MultiSelectInput = <T,>({
    id,
    options,
    value = [],
    onChange,
    onBlur,
    getOptionId,
    getOptionName,
    placeholder = 'Select options...',
    disabled,
}: MultiSelectInputProps<T>) => {
    const [isOpen, setIsOpen] = useState(false);
    const multiselectContainerRef = useRef<HTMLDivElement>(null);

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

    useOnClickOutside({
        ignoreClickRefs: [multiselectContainerRef],
        onOutsideClick: () => {
            setIsOpen(false);
            onBlur?.();
        },
        isEnabled: isOpen,
    });

    const displayLabel = useMemo(() => {
        if (value.length === 0) return placeholder;
        return value.map(getOptionName).join(', ');
    }, [value, getOptionName, placeholder]);

    return (
        <div className="multiselect" ref={multiselectContainerRef}>
            <button
                id={id}
                type="button"
                className={classNames('multiselect__placeholder-container', {
                    'multiselect__placeholder-container--opened': isOpen,
                    'multiselect__placeholder-container--disabled': disabled,
                })}
                onClick={toggleDropdown}
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <div
                    className={classNames('multiselect__placeholder', {
                        'multiselect__placeholder--has-value': value.length > 0,
                    })}
                >
                    <div className="multiselect__placeholder-content">{displayLabel}</div>
                    <div className="multiselect__chevron">
                        <img
                            src={isOpen ? ArrowUp : ArrowDown}
                            alt={
                                isOpen
                                    ? COMMON_TEXT_ADMIN.ALT.COLLAPSE_OPTIONS_LIST
                                    : COMMON_TEXT_ADMIN.ALT.EXPAND_OPTIONS_LIST
                            }
                        />
                    </div>
                </div>
            </button>

            {isOpen && !disabled && (
                <div className="multiselect__options-container" role="listbox" aria-multiselectable="true">
                    {options.map((option) => {
                        const selected = isSelected(option);
                        const optionId = getOptionId(option);
                        return (
                            <div
                                key={optionId}
                                className={classNames('multiselect__option', {
                                    'multiselect__option--selected': selected,
                                })}
                                onClick={() => toggleOption(option)}
                                onKeyDown={(e) => handleOptionKeyDown(e, option)}
                                role="option"
                                aria-selected={selected}
                                tabIndex={0}
                            >
                                <div className="multiselect__option-checkbox">
                                    <img
                                        src={selected ? CheckedBox : UncheckedBox}
                                        alt={
                                            selected
                                                ? COMMON_TEXT_ADMIN.ALT.OPTION_SELECTED
                                                : COMMON_TEXT_ADMIN.ALT.OPTION_NOT_SELECTED
                                        }
                                    />
                                </div>
                                <span className="multiselect__option-content">{getOptionName(option)}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
