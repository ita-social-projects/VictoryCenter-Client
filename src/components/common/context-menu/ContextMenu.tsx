import React, { RefObject, useState } from "react";
import classNames from "classnames";
import DefaultIcon from "../../../assets/icons/menu.svg";
import "./context-menu.scss";

export type ContextMenuProps = {
    children: React.ReactNode;
    onOptionSelected: (value: string, data?: any) => void;
    containerRef?: RefObject<HTMLDivElement | null>;
    className?: string;
    customIcon?: string;
};

export const ContextMenu = ({
    children,
    onOptionSelected,
    containerRef,
    className,
    customIcon
}: ContextMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleOptionClick = (value: string, data?: any) => {
        setIsOpen(false);
        onOptionSelected(value, data);
    };

    return (
        <div
            role="toolbar"
            ref={containerRef}
            className={classNames("context-menu", className, {
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