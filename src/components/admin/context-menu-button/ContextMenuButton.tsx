import React, { useCallback, useRef, useState } from 'react';
import { useOnClickOutside } from '../../../hooks/common/use-on-click-outside/useOnClickOutside';
import { ReactComponent as MenuIcon } from '../../../assets/icons/menu.svg';
import classNames from 'classnames';
import './ContextMenuButton.scss';

export interface ContextMenuButtonProps {
    children: React.ReactNode;
    onOptionSelected: (value: string, data?: any) => void;
    CustomIcon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

export const ContextMenuButton = ({ children, onOptionSelected, CustomIcon }: ContextMenuButtonProps) => {
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

    const handleClickOutside = useCallback(() => {
        setIsOpen(false);
    }, []);

    useOnClickOutside({
        ignoreClickRefs: [menuRef],
        onOutsideClick: handleClickOutside,
        isDisabled: !isOpen,
    });

    return (
        <div
            role="menu"
            ref={menuRef}
            data-testid="context-menu"
            className={classNames('context-menu-button', {
                'context-menu-button-active': isOpen,
            })}
            tabIndex={0}
            onClick={handleToggle}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleToggle();
                }
            }}
        >
            {CustomIcon ? (
                <CustomIcon className="context-menu-button-icon" />
            ) : (
                <MenuIcon className="context-menu-button-icon" />
            )}

            <div
                className={classNames('context-menu-button-options', {
                    'context-menu-button-options-visible': isOpen,
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

export interface ContextMenuOptionProps {
    children: React.ReactNode;
    value: string;
    data?: any;
    onOptionClick?: (value: string, data?: any) => void;
    className?: string;
    disabled?: boolean;
}

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
