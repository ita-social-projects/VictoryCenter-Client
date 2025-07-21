import React, {RefObject, useEffect, useRef, useState} from "react";
import classNames from "classnames";
import DefaultIcon from "../../../assets/icons/menu.svg";
import "./context-menu.scss";

export type ContextMenuProps = {
    children: React.ReactNode;
    onOptionSelected: (value: string, data?: any) => void;
    containerRef?: RefObject<HTMLDivElement | null>;
    customIcon?: string;
};

export const ContextMenu = ({
    children,
    onOptionSelected,
    containerRef,
    customIcon
}: ContextMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleOptionClick = (value: string, data?: any) => {
        setIsOpen(false);
        onOptionSelected(value, data);
    };

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
            role="context-menu"
            ref={containerRef || menuRef}
            data-testid="context-menu"
            className={classNames("context-menu", {
                "context-menu-active": isOpen,
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

            <div className={classNames("context-menu-options", {
                "context-menu-options-visible": isOpen
            })}>
                {React.Children.map(children, (child) => {
                    if (React.isValidElement<ContextMenuOptionProps>(child) && child.type === ContextMenu.Option) {
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

ContextMenu.Option = ({
    children,
    value,
    data,
    onOptionClick,
    className,
    disabled = false
}: ContextMenuOptionProps) => {
    const handleClick = () => {
        if (!disabled && onOptionClick) {
            onOptionClick(value, data);
        }
    };

    return (
        <button
            className={classNames("context-menu-option", className)}
            onClick={handleClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};

export default ContextMenu;
