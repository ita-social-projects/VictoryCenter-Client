import React, { RefObject, useState } from 'react';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';
import ArrowDown from '../../../assets/icons/chevron-down.svg';
import ArrowUp from '../../../assets/icons/chevron-up.svg';
import classNames from 'classnames';
import './Select.scss';

export type SelectProps<TValue> = {
    children: React.ReactNode;
    onValueChange: (value: TValue) => void;
    selectContainerRef?: RefObject<HTMLDivElement | null>;
    placeholder?: string;
    className?: string;
    isAutocomplete?: boolean;
};

export const Select = <TValue,>({
    children,
    onValueChange,
    selectContainerRef,
    className,
    placeholder,
    isAutocomplete = false,
}: SelectProps<TValue>) => {
    const options = React.Children.toArray(children).filter((x) => React.isValidElement(x) && x.type === Select.Option);
    const [isOpen, setIsOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState<TValue | null>(null);
    const [selectedName, setSelectedName] = useState<string | null>(null);

    const handleOpenSelect = () => {
        setIsOpen(!isOpen);
    };

    const handleSelect = (value: TValue, name: string) => {
        setSelectedValue(value);
        setSelectedName(name);
        onValueChange(value);
        setIsOpen(false);
    };

    const handleContainerClick = () => {
        handleOpenSelect();
    };

    const handleOptionClick = (e: React.MouseEvent, value: TValue, name: string) => {
        e.stopPropagation();
        handleSelect(value, name);
    };

    return (
        <div
            role={'toolbar'}
            ref={selectContainerRef}
            onClick={handleContainerClick}
            className={classNames('select', className, {
                'select-opened': isOpen,
                'select-closed': !isOpen,
            })}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    handleOpenSelect();
                }
            }}
        >
            <span
                className={classNames('empty', {
                    'not-empty': selectedValue !== null && selectedValue !== undefined,
                })}
            >
                {selectedName ?? placeholder ?? COMMON_TEXT_ADMIN.STATUS.DEFAULT}
            </span>
            <img
                src={isOpen ? ArrowUp : ArrowDown}
                alt={isOpen ? COMMON_TEXT_ADMIN.ALT.COLLAPSE_OPTIONS_LIST : COMMON_TEXT_ADMIN.ALT.EXPAND_OPTIONS_LIST}
            />
            {isOpen && (
                <div className={'select-options'}>
                    {options.map((opt, index) => {
                        if (!React.isValidElement(opt)) return null;
                        const { name, value } = opt.props as { children: React.ReactNode; value: TValue; name: string };
                        return (
                            <button
                                key={`${name}-${index}`}
                                className={classNames({
                                    'select-options-selected': !isAutocomplete && selectedValue === value,
                                })}
                                onClick={(e) => handleOptionClick(e, value, name)}
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

Select.Option = <TValue,>({ children }: { children?: React.ReactNode; value: TValue; name: string }) => <>{children}</>;
