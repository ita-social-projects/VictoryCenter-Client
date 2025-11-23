import { useState } from 'react';
import styles from './Header.module.scss';
import { ReactComponent as VictoryCenterLogo } from '../../../assets/icons/logo-with-text.svg';
import { PUBLIC_ROUTES } from '../../../const/public/routes';
import { DropdownLink, DropdownMenu } from '../dropdown-menu/DropdownMenu';
import { ReactComponent as BurgerIcon } from '../../../assets/icons/burger.svg';
import { LanguageSwitcher } from '../language-switcher/LanguageSwitcher';
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
        <div className={styles['header-block']}>
            <div className={styles['logo-container']}>
                <Link to="/">
                    <VictoryCenterLogo className={styles['logo']} />
                </Link>
            </div>

            <div className={styles['link-container']}>
                <nav>
                    <DropdownMenu mainText={t('ABOUT_US')} links={dropdownMenuLinks}></DropdownMenu>
                    <Link to={PUBLIC_ROUTES.PROGRAMS.FULL}>{t('PROGRAMS')}</Link>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} className={styles['disable']}>
                        {t('REPORTING')}
                    </Link>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} className={styles['disable']}>
                        {t('HOW_TO_SUPPORT')}
                    </Link>
                </nav>
            </div>

            <div className={styles['button-container']}>
                <LanguageSwitcher className={styles['language-switcher']} />
                <button className={styles['contact-us-button']} onClick={onContactUsClick}>
                    {t('CONTACT_US')}
                </button>
                <Link to={PUBLIC_ROUTES.DONATE.FULL} className={styles['button donate-button']}>
                    {t('DONATE')}
                </Link>w
                <button onClick={toggleMenu} className={styles['burger-menu-icon']}>
                    <BurgerIcon />
                </button>
            </div>
            {isMenuOpen && (
                <div className={styles['mobile-menu']}>
                    <Link to={PUBLIC_ROUTES.ABOUT_US.FULL} onClick={toggleMenu}>
                        {t('ABOUT_US')}
                    </Link>
                    <Link to={PUBLIC_ROUTES.PROGRAMS.FULL} onClick={toggleMenu}>
                        {t('PROGRAMS')}
                    </Link>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} onClick={toggleMenu} className={styles['disable']}>
                        {t('REPORTING')}
                    </Link>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} onClick={toggleMenu} className={styles['disable']}>
                        {t('HOW_TO_SUPPORT')}
                    </Link>
                    <LanguageSwitcher onValueChange={toggleMenu} className={styles['mobile-language-switcher']} />
                </div>
            )}
        </div>
    );
};
