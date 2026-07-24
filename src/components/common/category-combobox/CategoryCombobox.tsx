import React, { KeyboardEvent, RefObject, useMemo, useRef, useState } from 'react';
import { ReactComponent as ArrowDown } from '@/assets/icons/chevron-down.svg';
import { ReactComponent as ArrowUp } from '@/assets/icons/chevron-up.svg';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { useOnClickOutside } from '@/hooks/common/use-on-click-outside/useOnClickOutside';
import classNames from 'classnames';
import '@/components/common/select/Select.scss';
import './CategoryCombobox.scss';

export interface CategoryComboboxOption {
    id: number;
    name: string;
}

export interface CategoryComboboxProps {
    options: CategoryComboboxOption[];
    inputValue: string;
    onInputValueChange: (value: string) => void;
    onOptionSelect: (option: CategoryComboboxOption) => void;
    selectContainerRef?: RefObject<HTMLDivElement | null>;
    placeholder?: string;
    className?: string;
    headClassName?: string;
    optionClassName?: string;
    disabled?: boolean;
    id?: string;
    notFoundMessage?: string;
}

export const CategoryCombobox = ({
    options,
    inputValue,
    onInputValueChange,
    onOptionSelect,
    selectContainerRef,
    placeholder,
    className,
    headClassName,
    optionClassName,
    disabled = false,
    id,
    notFoundMessage = COMMON_TEXT_ADMIN.LIST.NOT_FOUND,
}: CategoryComboboxProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const setContainerRef = (node: HTMLDivElement | null) => {
        containerRef.current = node;
        if (selectContainerRef) {
            selectContainerRef.current = node;
        }
    };

    const normalizedQuery = inputValue.trim().toLowerCase();

    const filteredOptions = useMemo(
        () =>
            normalizedQuery === ''
                ? options
                : options.filter((option) => option.name.toLowerCase().includes(normalizedQuery)),
        [options, normalizedQuery],
    );

    const openDropdown = () => {
        if (disabled) return;
        setIsOpen(true);
    };

    const closeDropdown = () => {
        setIsOpen(false);
        setHighlightedIndex(-1);
    };

    useOnClickOutside({
        ignoreClickRefs: [containerRef],
        onOutsideClick: closeDropdown,
        isDisabled: !isOpen,
    });

    const selectOption = (option: CategoryComboboxOption) => {
        onOptionSelect(option);
        closeDropdown();
    };

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        onInputValueChange(event.target.value);
        setHighlightedIndex(-1);
        openDropdown();
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (disabled) return;

        if (event.key === 'ArrowDown') {
            event.preventDefault();
            if (!isOpen) {
                openDropdown();
                return;
            }
            setHighlightedIndex((previousIndex) =>
                previousIndex < filteredOptions.length - 1 ? previousIndex + 1 : previousIndex,
            );
        } else if (event.key === 'ArrowUp') {
            event.preventDefault();
            setHighlightedIndex((previousIndex) => (previousIndex > 0 ? previousIndex - 1 : 0));
        } else if (event.key === 'Enter') {
            if (isOpen && highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
                event.preventDefault();
                selectOption(filteredOptions[highlightedIndex]);
            } else {
                closeDropdown();
            }
        } else if (event.key === 'Escape') {
            closeDropdown();
        }
    };

    return (
        <div
            ref={setContainerRef}
            className={classNames('select', className, {
                'select-opened': isOpen,
                'select-closed': !isOpen,
                'select-disabled': disabled,
            })}
        >
            <div
                className={classNames('select-head', headClassName)}
                onClick={() => {
                    if (disabled) return;
                    inputRef.current?.focus();
                    openDropdown();
                }}
            >
                <input
                    ref={inputRef}
                    id={id}
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onFocus={openDropdown}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled}
                    autoComplete="off"
                />
                {isOpen ? <ArrowUp /> : <ArrowDown />}
            </div>

            {isOpen && !disabled && (
                <div className="select-options">
                    {filteredOptions.length === 0 ? (
                        <div className="category-combobox-not-found">{notFoundMessage}</div>
                    ) : (
                        filteredOptions.map((option, index) => (
                            <button
                                key={option.id}
                                type="button"
                                className={classNames(optionClassName, {
                                    'category-combobox-option-active': index === highlightedIndex,
                                })}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    selectOption(option);
                                }}
                                onMouseEnter={() => setHighlightedIndex(index)}
                            >
                                <span>{option.name}</span>
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};
