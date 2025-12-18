import { useState } from 'react';
import './Header.scss';
import { ReactComponent as VictoryCenterLogo } from '@/assets/icons/logo-with-text.svg';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import { DropdownLink, DropdownMenu } from '@/components/public/dropdown-menu/DropdownMenu';
import { ReactComponent as BurgerIcon } from '@/assets/icons/burger.svg';
import { LanguageSwitcher } from '@/components/public/language-switcher/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const Header = () => {
    const { t } = useTranslation('header');

    const dropdownMenuLinks: DropdownLink[] = [
        { text: t('WHO_WE_ARE'), navigateTo: PUBLIC_ROUTES.ABOUT_US.FULL, isDisabled: false },
        { text: t('HISTORY'), navigateTo: '', isDisabled: true },
        { text: t('TEAM'), navigateTo: PUBLIC_ROUTES.TEAM.FULL, isDisabled: false },
        { text: t('PARTNERS'), navigateTo: PUBLIC_ROUTES.PARTNERS.FULL, isDisabled: false },
        { text: t('EVENTS_AND_NEWS'), navigateTo: '', isDisabled: true },
    ];
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
                    <DropdownMenu mainText={t('ABOUT_US')} links={dropdownMenuLinks}></DropdownMenu>
                    <Link to={PUBLIC_ROUTES.PROGRAMS.FULL}>{t('PROGRAMS')}</Link>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} className="disable">
                        {t('REPORTING')}
                    </Link>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} className="disable">
                        {t('HOW_TO_SUPPORT')}
                    </Link>
                </nav>
            </div>

            <div className="button-container">
                <LanguageSwitcher className="language-switcher" />
                <button className="contact-us-button" onClick={onContactUsClick}>
                    {t('CONTACT_US')}
                </button>
                <Link to={PUBLIC_ROUTES.DONATE.FULL} className="button donate-button">
                    {t('DONATE')}
                </Link>
                <button onClick={toggleMenu} className="burger-menu-icon">
                    <BurgerIcon />
                </button>
            </div>
            {isMenuOpen && (
                <div className="mobile-menu">
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
                    <LanguageSwitcher onValueChange={toggleMenu} className="mobile-language-switcher" />
                </div>
            )}
        </div>
    );
};
