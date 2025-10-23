import styles from './Header.module.scss';
import { ReactComponent as VictoryCenterLogo } from '../../../assets/icons/logo-with-text.svg';
import { PUBLIC_ROUTES } from '../../../const/public/routes';
import { DropdownMenu } from '../dropdown-menu/DropdownMenu';
import { LanguageSwitcher } from '../language-switcher/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { getDropdownMenuLinks } from './config';
import { useMediaQuery } from '@mui/material';
import { BurgerMenu } from './BurgerMenu';

export const Header = () => {
    const { t } = useTranslation('header');
    const dropdownMenuLinks = getDropdownMenuLinks(t);
    const isLessThenLg = useMediaQuery('(max-width: 1440px)');

    const onContactUsClick = () => {
        //TODO: remove this log after implementing an actual logic
        //eslint-disable-next-line no-console
        console.log('CONTACT USED!');
    };

    return (
        <div className={styles.container}>
            <Link to="/">
                <VictoryCenterLogo />
            </Link>

            <nav className={styles.navigation}>
                <DropdownMenu mainText={t('ABOUT_US')} links={dropdownMenuLinks} />
                <Link to={PUBLIC_ROUTES.PROGRAMS.FULL}>{t('PROGRAMS')}</Link>
                <Link to={PUBLIC_ROUTES.MOCK.FULL} className={styles.disableLink}>
                    {t('REPORTING')}
                </Link>
                <Link to={PUBLIC_ROUTES.MOCK.FULL} className={styles.disableLink}>
                    {t('HOW_TO_SUPPORT')}
                </Link>
            </nav>

            <div className={styles.buttonContainer}>
                {!isLessThenLg && <LanguageSwitcher />}
                <button className={styles.whiteButton} onClick={onContactUsClick}>
                    {t('CONTACT_US')}
                </button>
                <Link to={PUBLIC_ROUTES.DONATE.FULL} className={styles.blackButton}>
                    {t('DONATE')}
                </Link>
                {isLessThenLg && <BurgerMenu />}
            </div>
        </div>
    );
};
