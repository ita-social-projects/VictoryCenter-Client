import React, { useState } from 'react';
import './DropdownMenu.scss';
import { ReactComponent as ArrowUp } from '../../../assets/icons/chevron-up.svg';
import { ReactComponent as ArrowDown } from '../../../assets/icons/chevron-down.svg';
import { Link } from 'react-router';
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

    const handleDropdownClick = () => {
        setIsOpen(!isOpen);
    };

    const handleLinkClick = () => {
        setIsOpen(!isOpen);
    };
    return (
        <div className="dropdown">
            <button className="dropdown-button" onClick={handleDropdownClick}>
                {mainText} {isOpen ? <ArrowDown /> : <ArrowUp />}
            </button>
            {isOpen ? (
                <div className="dropdown-links">
                    {links.map((option, index) => (
                        <div key={index} className="dropdown-link">
                            <Link
                                onClick={handleLinkClick}
                                className={classNames({ disable: option.isDisabled })}
                                to={option.navigateTo}
                            >
                                {option.text}
                            </Link>
                        </div>
                    ))}
                </div>
            ) : (
                <></>
            )}
        </div>
    );
};
