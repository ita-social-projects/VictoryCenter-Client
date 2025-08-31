import React, { useState } from 'react';
import './Header.scss';
import { Link } from 'react-router';
import { ReactComponent as VictoryCenterLogo } from '../../../assets/icons/logo-with-text.svg';
import { PUBLIC_ROUTES } from '../../../const/public/routes';
import { ABOUT_US, CONTACT_US, DONATE, HOW_TO_SUPPORT, PROGRAMS, REPORTING } from '../../../const/public/header';
import { ReactComponent as BurgerIcon } from '../../../assets/icons/burger.svg';

export const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

    const toggleMenu = () => {
        setIsMenuOpen((prev: boolean) => !prev);
    };

    const onContactUsClick = () => {
        //TODO: remove this log after implementing an actual logic
        //eslint-disable-next-line no-console
        console.log('CONTACT USED!');
    };

    return (
        <div className="header-block">
            <div className="logo-container">
                <Link to="/">
                    <VictoryCenterLogo className="logo" />
                </Link>
            </div>

            <div className="link-container">
                <nav>
                    <Link to={PUBLIC_ROUTES.ABOUT_US.FULL}>{ABOUT_US}</Link>
                    <Link to={PUBLIC_ROUTES.PROGRAMS.FULL}>{PROGRAMS}</Link>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} className="disable">
                        {REPORTING}
                    </Link>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} className="disable">
                        {HOW_TO_SUPPORT}
                    </Link>
                </nav>
            </div>

            <div className="button-container">
                <button className="contact-us-button" onClick={onContactUsClick}>
                    {CONTACT_US}
                </button>
                <Link to={PUBLIC_ROUTES.DONATE.FULL} className="button donate-button">
                    {DONATE}
                </Link>
                <button onClick={toggleMenu} className="burger-menu-icon">
                    <BurgerIcon />
                </button>
            </div>
            {isMenuOpen && (
                <div className="mobile-menu">
                    <Link to={PUBLIC_ROUTES.ABOUT_US.FULL} onClick={toggleMenu}>
                        {ABOUT_US}
                    </Link>
                    <Link to={PUBLIC_ROUTES.PROGRAMS.FULL} onClick={toggleMenu}>
                        {PROGRAMS}
                    </Link>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} onClick={toggleMenu} className="disable">
                        {REPORTING}
                    </Link>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} onClick={toggleMenu} className="disable">
                        {HOW_TO_SUPPORT}
                    </Link>
                </div>
            )}
        </div>
    );
};
