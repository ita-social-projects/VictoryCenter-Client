import { useState } from 'react';
import { ReactComponent as BurgerIcon } from '../../../../assets/icons/burger.svg';
import cn from 'classnames';
import { Link } from 'react-router-dom';
import { LanguageSwitcher } from '../../language-switcher/LanguageSwitcher';
import styles from './styles.module.scss';
import { useTranslation } from 'react-i18next';
import { getMobileDropdownMenuLinks } from '../config';

export const BurgerMenu = () => {
    const { t } = useTranslation('header');
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
    const mobileDropdownMenuLinks = getMobileDropdownMenuLinks(t);

    const toggleMenu = () => {
        setIsMenuOpen((prev: boolean) => !prev);
    };

    return (
        <>
            <button onClick={toggleMenu} className={styles.burgerMenuIcon}>
                <BurgerIcon />
            </button>

            {isMenuOpen && (
                <div className={styles.menu}>
                    {mobileDropdownMenuLinks.map((link, index) => (
                        <Link
                            key={index}
                            to={link.href}
                            onClick={toggleMenu}
                            className={cn([styles.menuLink, { [styles.disableLink]: link.disabled }])}
                        >
                            {link.title}
                        </Link>
                    ))}
                    {<LanguageSwitcher onValueChange={toggleMenu} />}
                </div>
            )}
        </>
    );
};
