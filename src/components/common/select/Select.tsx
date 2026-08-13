import React, { RefObject, useEffect, useState, useRef, useMemo } from 'react';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { ReactComponent as ArrowDown } from '@/assets/icons/chevron-down.svg';
import { ReactComponent as ArrowUp } from '@/assets/icons/chevron-up.svg';
import classNames from 'classnames';
import './Select.scss';

export type SelectProps<TValue> = {
    children: React.ReactNode;
    onValueChange: (value: TValue) => void;
    value?: TValue;
    selectContainerRef?: RefObject<HTMLDivElement | null>;
    placeholder?: string;
    className?: string;
    headClassName?: string;
    optionClassName?: string;
    isAutocomplete?: boolean;
    icon?: React.ElementType<React.SVGProps<SVGSVGElement>>;
    openOnHover?: boolean;
    disabled?: boolean;
};

export const Select = <TValue,>({
    children,
    onValueChange,
    value,
    selectContainerRef,
    className,
    headClassName,
    optionClassName,
    placeholder,
    isAutocomplete = false,
    icon: Icon,
    openOnHover = false,
    disabled = false,
}: SelectProps<TValue>) => {
    const options = React.Children.toArray(children).filter((child) => {
        return React.isValidElement(child) && child.type === Select.Option;
    }) as React.ReactElement<SelectOptionProps<TValue>>[];

    const [isOpen, setIsOpen] = useState(false);

    const internalRef = useRef<HTMLDivElement>(null);
    const containerRef = useMemo(() => selectContainerRef || internalRef, [selectContainerRef]);

    useEffect(() => {
        if (disabled) {
            setIsOpen(false);
        }
    }, [disabled]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, containerRef]);

    const selectedOption = options.find((opt) => opt.props.value === value);
    const hasValue = value !== null && value !== undefined;
    const displayLabel =
        hasValue && selectedOption ? selectedOption.props.name : (placeholder ?? COMMON_TEXT_ADMIN.STATUS.DEFAULT);

    const handleOpenSelect = (e: React.MouseEvent) => {
        if (openOnHover && e.detail !== 0) return;
        setIsOpen(!isOpen);
    };

    const handleSelect = (newValue: TValue) => {
        onValueChange(newValue);
        setIsOpen(false);
    };

    const handleOptionClick = (e: React.MouseEvent, val: TValue) => {
        e.stopPropagation();
        handleSelect(val);
    };

    const handleMouseEnter = () => {
        if (disabled) return;
        if (openOnHover) setIsOpen(true);
    };

    const handleMouseLeave = () => {
        if (openOnHover) setIsOpen(false);
    };

    return (
        <div
            ref={containerRef}
            className={classNames('select', className, {
                'select-opened': isOpen,
                'select-closed': !isOpen,
                'select-disabled': disabled,
            })}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button
                type="button"
                className={classNames('select-head', headClassName)}
                onClick={handleOpenSelect}
                disabled={disabled}
                onKeyDown={(e) => {
                    if (disabled) return;
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setIsOpen((prev) => !prev);
                    }
                }}
            >
                {Icon && <Icon />}
                <span
                    className={classNames('empty', {
                        'not-empty': hasValue,
                    })}
                >
                    {displayLabel}
                </span>
                {isOpen ? <ArrowUp /> : <ArrowDown />}
            </button>
            {isOpen && !disabled && (
                <div className={'select-options'}>
                    {options.map((opt, index) => {
                        const { name, value: optValue } = opt.props;
                        return (
                            <button
                                key={`${name}-${index}`}
                                className={classNames(optionClassName, {
                                    'select-options-selected': !isAutocomplete && value === optValue,
                                })}
                                onClick={(e) => handleOptionClick(e, optValue)}
                                disabled={disabled}
                            >
                                <span>{name}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export interface SelectOptionProps<TValue> {
    value: TValue;
    name: string;
}

Select.Option = <TValue,>(_props: SelectOptionProps<TValue>) => null;
