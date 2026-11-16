import React, { useState } from 'react';
import './DropdownMenu.scss';
import { ReactComponent as ArrowUp } from '@/assets/icons/chevron-up.svg';
import { ReactComponent as ArrowDown } from '@/assets/icons/chevron-down.svg';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
export interface DropdownLink {
    text: string;
    navigateTo: string;
    isDisabled: boolean;
}
export interface DropdownMenuProps {
    mainText: string;
    links: DropdownLink[];
    trigger?: 'hover' | 'click';
    className?: string;
    onLinkClick?: () => void;
}

export const DropdownMenu = ({ links, mainText, trigger = 'hover', className, onLinkClick }: DropdownMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleOnMouseEnter = () => {
        if (trigger === 'hover') {
            setIsOpen(true);
        }
    };

    const handleLinkClick = () => {
        setIsOpen(false);
        onLinkClick?.();
    };

    const handleButtonClick = () => {
        if (trigger === 'click') {
            setIsOpen((prev) => !prev);
        }
    };

    const handleOnMouseLeave = () => {
        if (trigger === 'hover') {
            setIsOpen(false);
        }
    };

    return (
        <div
            className={classNames('dropdown', className)}
            onMouseEnter={handleOnMouseEnter}
            onMouseLeave={handleOnMouseLeave}
        >
            <button type="button" className="dropdown-button" onClick={handleButtonClick}>
                {mainText} {isOpen ? <ArrowUp /> : <ArrowDown />}
            </button>

            {isOpen && (
                <div className="dropdown-links">
                    {links.map((option, index) => (
                        <Link
                            onClick={handleLinkClick}
                            key={index}
                            className={classNames('dropdown-link', {
                                disable: option.isDisabled,
                            })}
                            to={option.navigateTo}
                        >
                            {option.text}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};
