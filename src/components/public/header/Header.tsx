import React, { useState } from 'react';
import './Header.scss';
import { Link } from 'react-router';
import { ReactComponent as VictoryCenterLogo } from '../../../assets/icons/logo-with-text.svg';
import { PUBLIC_ROUTES } from '../../../const/public/routes';
// import { ABOUT_US, CONTACT_US, DONATE, HOW_TO_SUPPORT, PROGRAMS, REPORTING } from '../../../const/public/header';
import { ReactComponent as BurgerIcon } from '../../../assets/icons/burger.svg';
import { useTranslation } from 'react-i18next';
import '../../../i18n';
import { LanguageSwitcher } from '../language-switcher/LanguageSwitcher';

export const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

    const { t } = useTranslation('header');

    const toggleMenu = () => {
        setIsMenuOpen((prev: boolean) => !prev);
    };

    const onContactUsClick = () => {
        //TODO: remove this log after implementing an actual logic
        //eslint-disable-next-line no-console
        console.log('CONTACT USED!');
    };

    return (
        <div className="headerBlock">
            <div className="logoContainer">
                <Link to="/">
                    <VictoryCenterLogo className="logo" />
                </Link>
            </div>

            <LanguageSwitcher />

            <div className="linkContainer">
                <nav>
                    <Link to={PUBLIC_ROUTES.ABOUT_US.FULL}>{t('ABOUT_US')}</Link>
                    <Link to={PUBLIC_ROUTES.PROGRAMS.FULL}>{t('PROGRAMS')}</Link>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} className="disable">
                        {t('REPORTING')}
                    </Link>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} className="disable">
                        {t('HOW_TO_SUPPORT')}
                    </Link>
                </nav>
            </div>

            <div className="buttonContainer">
                <button className="contactUsButton" onClick={onContactUsClick}>
                    {t('CONTACT_US')}
                </button>
                <Link to={PUBLIC_ROUTES.DONATE.FULL} className="button donateButton">
                    {t('DONATE')}
                </Link>
                <button onClick={toggleMenu} className="burgerMenuIcon">
                    <BurgerIcon />
                </button>
            </div>
            {isMenuOpen && (
                <div className="mobileMenu">
                    <Link to={PUBLIC_ROUTES.ABOUT_US.FULL} onClick={toggleMenu}>
                        {t('ABOUT_US')}
                    </Link>
                    <Link to={PUBLIC_ROUTES.PROGRAMS.FULL} onClick={toggleMenu}>
                        {t('PROGRAMS')}
                    </Link>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} onClick={toggleMenu} className="disable">
                        {t('REPORTING')}
                    </Link>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} onClick={toggleMenu} className="disable">
                        {t('HOW_TO_SUPPORT')}
                    </Link>
                </div>
            )}
        </div>
    );
};
