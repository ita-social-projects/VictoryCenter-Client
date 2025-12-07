import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useOnClickOutside } from '@hooks/common/use-on-click-outside/useOnClickOutside';
import { ReactComponent as CheckedBox } from '@assets/icons/chevron-checked.svg';
import { ReactComponent as UncheckedBox } from '@assets/icons/chevron-unchecked.svg';
import { ReactComponent as ArrowDown } from '@assets/icons/chevron-down.svg';
import { ReactComponent as ArrowUp } from '@assets/icons/chevron-up.svg';
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

    const displayLabel = useMemo(() => {
        if (value.length === 0) return placeholder;
        return value.map(getOptionName).join(', ');
    }, [value, getOptionName, placeholder]);

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

    const handleOptionKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>, option: T) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleOption(option);
            } else if (e.key === 'Escape') {
                e.preventDefault();
                setIsOpen(false);
                onBlur?.();
            }
        },
        [toggleOption, onBlur],
    );

    const handleOutsideClick = useCallback(() => {
        setIsOpen(false);
        onBlur?.();
    }, [onBlur]);

    useOnClickOutside({
        ignoreClickRefs: [multiselectContainerRef],
        onOutsideClick: handleOutsideClick,
        isDisabled: !isOpen,
    });

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
                    <div className="multiselect__chevron">{isOpen ? <ArrowUp /> : <ArrowDown />}</div>
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
                                    {selected ? <CheckedBox /> : <UncheckedBox />}
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
