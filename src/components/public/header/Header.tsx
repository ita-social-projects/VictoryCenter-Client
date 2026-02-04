import { useState } from 'react';
import './Header.scss';
import { ReactComponent as VictoryCenterLogo } from '@/assets/icons/logo-with-text.svg';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import { DropdownLink, DropdownMenu } from '@/components/public/dropdown-menu/DropdownMenu';
import { ReactComponent as BurgerIcon } from '@/assets/icons/burger.svg';
import { LanguageSwitcher } from '@/components/public/language-switcher/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { Link } from '@/components/common/link';
import { Button } from '@/components/public/ui/button';

export const Header = () => {
    const { t } = useTranslation('header');
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

    const toggleMenu = () => {
        setIsMenuOpen((prev: boolean) => !prev);
    };

    const onContactUsClick = () => {
        //TODO: remove this log after implementing an actual logic
        //eslint-disable-next-line no-console
        console.log('CONTACT USED!');
    };

    const aboutUsLinks: DropdownLink[] = [
        { text: t('WHO_WE_ARE'), navigateTo: PUBLIC_ROUTES.ABOUT_US.FULL, isDisabled: false },
        { text: t('HISTORY'), navigateTo: '', isDisabled: true },
        { text: t('TEAM'), navigateTo: PUBLIC_ROUTES.TEAM.FULL, isDisabled: false },
        { text: t('PARTNERS'), navigateTo: PUBLIC_ROUTES.PARTNERS.FULL, isDisabled: false },
        { text: t('EVENTS_AND_NEWS'), navigateTo: '', isDisabled: true },
    ];

    const programsLinks: DropdownLink[] = [
        { text: t('HIPPOTHERAPY'), navigateTo: '', isDisabled: true },
        { text: t('PROGRAMS'), navigateTo: PUBLIC_ROUTES.PROGRAMS.FULL, isDisabled: false },
        { text: t('PROGRAMS_SESSIONS'), navigateTo: '', isDisabled: true },
    ];

    return (
        <>
            <header className="header-block">
                <div className="header-content-container">
                    <div className="logo-container">
                        <Link to="/">
                            <VictoryCenterLogo className="logo" />
                        </Link>
                    </div>

                    <div className="link-container">
                        <nav>
                            <DropdownMenu mainText={t('ABOUT_US')} links={aboutUsLinks} />

                            <DropdownMenu mainText={t('HIPPOTHERAPY')} links={programsLinks} />

                            <Link to={PUBLIC_ROUTES.REPORTS.FULL}>{t('REPORTING')}</Link>

                            <Link to={PUBLIC_ROUTES.MOCK.FULL} className="disable">
                                {t('STORIES_OF_VICTORIES')}
                            </Link>

                            <Link to={PUBLIC_ROUTES.MOCK.FULL} className="disable">
                                {t('HOW_TO_SUPPORT')}
                            </Link>
                        </nav>
                    </div>

                    <div className="button-container">
                        <LanguageSwitcher className="language-switcher" openOnHover={true} />

                        <Button variant="secondary-dark" onClick={onContactUsClick} className="contact-us-button">
                            {t('CONTACT_US')}
                        </Button>

                        <Button variant="primary-dark" href={PUBLIC_ROUTES.DONATE.FULL}>
                            {t('DONATE')}
                        </Button>

                        <Button
                            variant="tertiary"
                            size="large"
                            icon={BurgerIcon}
                            ariaLabel="Open menu"
                            onClick={toggleMenu}
                            className="burger-menu-icon"
                        />
                    </div>
                </div>

                {isMenuOpen && (
                    <div className="mobile-menu">
                        <Link to={PUBLIC_ROUTES.ABOUT_US.FULL} onClick={toggleMenu}>
                            {t('ABOUT_US')}
                        </Link>

                        <Link to={PUBLIC_ROUTES.PROGRAMS.FULL} onClick={toggleMenu}>
                            {t('HIPPOTHERAPY')}
                        </Link>

                        <Link to={PUBLIC_ROUTES.REPORTS.FULL} onClick={toggleMenu}>
                            {t('REPORTING')}
                        </Link>

                        <Link to={PUBLIC_ROUTES.MOCK.FULL} onClick={toggleMenu} className="disable">
                            {t('STORIES_OF_VICTORIES')}
                        </Link>

                        <Link to={PUBLIC_ROUTES.MOCK.FULL} onClick={toggleMenu} className="disable">
                            {t('HOW_TO_SUPPORT')}
                        </Link>

                        <LanguageSwitcher onValueChange={toggleMenu} className="mobile-language-switcher" />
                    </div>
                )}
            </header>

            <div className="header-spacer" />
        </>
    );
};
