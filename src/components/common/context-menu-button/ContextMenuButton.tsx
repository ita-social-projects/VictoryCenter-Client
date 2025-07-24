import React, { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import DefaultIcon from '../../../assets/icons/menu.svg';
import classNames from 'classnames';
import './context-menu-button.scss';

export type ContextMenuButtonProps = {
    children: React.ReactNode;
    onOptionSelected: (value: string, data?: any) => void;
    containerRef?: RefObject<HTMLDivElement | null>;
    customIcon?: string;
};

export const ContextMenuButton = ({ children, onOptionSelected, containerRef, customIcon }: ContextMenuButtonProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleToggle = useCallback(() => {
        setIsOpen((prev) => !prev);
    }, []);

    const handleOptionClick = useCallback(
        (value: string, data?: any) => {
            setIsOpen(false);
            onOptionSelected(value, data);
        },
        [onOptionSelected],
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div
            role="menu"
            ref={containerRef || menuRef}
            data-testid="context-menu"
            className={classNames('context-menu', {
                'context-menu-active': isOpen,
            })}
            tabIndex={0}
            onClick={handleToggle}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggle();
                }
            }}
        >
            <img src={customIcon || DefaultIcon} alt="menu" className="context-menu-icon" />

            <div
                className={classNames('context-menu-button-options', {
                    'context-menu-options-visible': isOpen,
                })}
            >
                {React.Children.map(children, (child) => {
                    if (
                        React.isValidElement<ContextMenuOptionProps>(child) &&
                        child.type === ContextMenuButton.Option
                    ) {
                        return React.cloneElement(child, { onOptionClick: handleOptionClick });
                    }
                    return child;
                })}
            </div>
        </div>
    );
};

export type ContextMenuOptionProps = {
    children: React.ReactNode;
    value: string;
    data?: any;
    onOptionClick?: (value: string, data?: any) => void;
    className?: string;
    disabled?: boolean;
};

ContextMenuButton.Option = ({
    children,
    value,
    data,
    onOptionClick,
    className,
    disabled = false,
}: ContextMenuOptionProps) => {
    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!disabled && onOptionClick) {
            onOptionClick(value, data);
        }
    };

    return (
        <button
            role="menuitem"
            className={classNames('context-menu-button-option', className)}
            onClick={handleClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};
