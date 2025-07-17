import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import CheckedBox from "../../../assets/icons/chevron-checked.svg";
import UncheckedBox from "../../../assets/icons/chevron-unchecked.svg";
import ArrowDown from "../../../assets/icons/chevron-down.svg";
import ArrowUp from "../../../assets/icons/chevron-up.svg";
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
  className?: string;
}

const validateProps = <T extends Record<string, any>>(props: MultiselectProps<T>) => {
  const { options, getOptionId, getOptionName } = props;

  if (!Array.isArray(options)) {
    throw new Error('Options must be an array');
  }

  if (typeof getOptionId !== 'function') {
    throw new Error('getOptionId must be a function');
  }

  if (typeof getOptionName !== 'function') {
    throw new Error('getOptionName must be a function');
  }

  // Check Ids uniqueness
  const ids = options.map(getOptionId);
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    console.warn('Duplicate option IDs detected. This may cause unexpected behavior.');
  }
};

export default function Multiselect<T extends Record<string, any>>({
    options,
    value = [],
    onChange,
    onBlur,
    getOptionId,
    getOptionName,
    placeholder = 'Select options...',
    className,
}: MultiselectProps<T>) {
    // Validate props on mount and change
    useEffect(() => {
        validateProps({ options, getOptionId, getOptionName } as MultiselectProps<T>);
    }, [options, getOptionId, getOptionName]);

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
        [value, selectedIds, getOptionId, onChange],
    );

    const toggleDropdown = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

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
        <div className={classNames('multiselect', className)} ref={containerRef}>
            <div
                className={classNames('multiselect-placeholder-container', {
                    'multiselect-placeholder-container-selected': isOpen,
                })}
                onClick={toggleDropdown}
            >
                <div className={classNames('placeholder', {
                  'placeholder-selected': value.length > 0,
                })}>
                    <div className='placeholder-content'>
                        {displayLabel}
                    </div>
                    <div className="placeholder-chevron">
                        <img src={isOpen ? ArrowUp : ArrowDown} alt={isOpen ? 'Collapse options' : 'Expand options'} />
                    </div>
                </div>
            </div>

            {isOpen && (
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
}
