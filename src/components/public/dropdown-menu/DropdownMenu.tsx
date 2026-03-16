import React, { useState } from 'react';
import './DropdownMenu.scss';
import { ReactComponent as ArrowRight } from '@/assets/icons/chevron-right.svg';
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
}

export const DropdownMenu = ({ links, mainText }: DropdownMenuProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleOnMouseEnter = () => {
        setIsOpen(true);
    };

    const handleLinkClick = () => {
        setIsOpen(!isOpen);
    };
    const handleOnMouseLeave = () => {
        setIsOpen(false);
    };

    return (
        <div className="dropdown" onMouseEnter={handleOnMouseEnter} onMouseLeave={handleOnMouseLeave}>
            <button className="dropdown-button">
                {mainText}{' '}
                <ArrowRight className={isOpen ? 'dropdown-chevron-icon--open' : 'dropdown-chevron-icon--closed'} />
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
