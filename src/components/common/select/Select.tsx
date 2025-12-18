import React, { RefObject, useState } from 'react';
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
}: SelectProps<TValue>) => {
    const options = React.Children.toArray(children).filter((child) => {
        return React.isValidElement(child) && child.type === Select.Option;
    }) as React.ReactElement<SelectOptionProps<TValue>>[];

    const [isOpen, setIsOpen] = useState(false);

    const selectedOption = options.find((opt) => opt.props.value === value);
    const hasValue = value !== null && value !== undefined;
    const displayLabel =
        hasValue && selectedOption ? selectedOption.props.name : (placeholder ?? COMMON_TEXT_ADMIN.STATUS.DEFAULT);

    const handleOpenSelect = () => {
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

    return (
        <div
            ref={selectContainerRef}
            className={classNames('select', className, {
                'select-opened': isOpen,
                'select-closed': !isOpen,
            })}
        >
            <button
                type="button"
                className={classNames('select-head', headClassName)}
                onClick={handleOpenSelect}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleOpenSelect();
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
            {isOpen && (
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
