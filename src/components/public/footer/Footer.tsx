import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ReactComponent as ArrowUpIcon } from '../../../assets/icons/arrow-up-right.svg';
import { ReactComponent as PhoneIcon } from '../../../assets/icons/phone.svg';
import { ReactComponent as MailIcon } from '../../../assets/icons/mail.svg';
import { PUBLIC_ROUTES } from '../../../const/public/routes';
import { useTranslation } from 'react-i18next';
import styles from './Footer.module.scss';

export const Footer = () => {
    const { t } = useTranslation('footer');

    const [email, setEmail] = useState('');

    const handleClick = () => {
        setEmail('');
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };
    const handleFacebookClick = () => {
        window.open(t('FACEBOOK'), '_blank', 'noopener,noreferrer');
    };

    const handleTelegramClick = () => {
        window.open(t('TELEGRAM'), '_blank', 'noopener,noreferrer');
    };

    const handleInstagramClick = () => {
        window.open(t('INSTAGRAM'), '_blank', 'noopener,noreferrer');
    };

    return (
        <div className={styles['footer-content']}>
            <div className={styles['main-block']}>
                <div className={styles['email-field']}>
                    <span className={styles['title']}>{t('STAY_UP_TO_DATE_WITH_THE_NEWS')}</span>
                    <div className={styles['input-block']}>
                        <input
                            type="email"
                            placeholder={t('ENTER_YOUR_EMAIL')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button onClick={handleClick} className={styles['subscribe-btn']} aria-label={t('SIGN_UP')}>
                            <ArrowUpIcon className={styles['arrow-up-icon']} />
                        </button>
                    </div>
                </div>

                <div className={styles['menu']}>
                    <span className={styles['title']}>{t('MENU')}</span>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} className={styles['disable']}>
                        {t('REPORTING')}
                    </Link>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} className={styles['disable']}>
                        {t('STORE')}
                    </Link>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} className={styles['disable']}>
                        {t('HOW_TO_SUPPORT')}
                    </Link>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} className={styles['disable']}>
                        {t('STORIES_OF_VICTORIES')}
                    </Link>
                </div>

                <div className={styles['about-us']}>
                    <span className={styles['title']}>{t('ABOUT_US')}</span>
                    <Link to={PUBLIC_ROUTES.ABOUT_US.FULL}>{t('ABOUT_US')}</Link>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} className={styles['disable']}>
                        {t('OUR_HISTORY')}
                    </Link>
                    <Link to={PUBLIC_ROUTES.TEAM.FULL}>{t('OUR_TEAM')}</Link>
                    <Link to={PUBLIC_ROUTES.PARTNERS.FULL}>{t('PARTNERS')}</Link>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} className={styles['disable']}>
                        {t('EVENTS_AND_NEWS')}
                    </Link>
                </div>

                <div className={styles['hippotherapy']}>
                    <span className={styles['title']}>{t('HIPPOTHERAPY')}</span>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} className={styles['disable']}>
                        {t('WHAT_IS_HIPPOTHERAPY')}
                    </Link>
                    <Link to={PUBLIC_ROUTES.PROGRAMS.FULL}>{t('PROGRAMS')}</Link>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} className={styles['disable']}>
                        {t('PROGRAMS_SESSIONS')}
                    </Link>
                </div>
            </div>

            <div className={styles['contact-block']}>
                <div className={styles['main-contacts']}>
                    <button className={styles['contact-item']} onClick={() => copyToClipboard(t('EMAIL'))}>
                        <MailIcon /> {t('EMAIL')}
                    </button>
                    <button className={styles['contact-item']} onClick={() => copyToClipboard(t('PHONE'))}>
                        <PhoneIcon /> {t('PHONE')}
                    </button>
                </div>
                <div className={styles['social-media']}>
                    <button className={styles['contact-item']} onClick={handleFacebookClick}>
                        Facebook
                    </button>
                    <button className={styles['contact-item']} onClick={handleTelegramClick}>
                        Telegram
                    </button>
                    <button className={styles['contact-item']} onClick={handleInstagramClick}>
                        Instagram
                    </button>
                </div>
            </div>
            <div className={styles['scrolling-text-wrapper']}>
                <p className={styles['scrolling-text']}>
                    <span>{t('VICTORY_STARTS_WITH_YOU')} </span>
                    <span> {t('VICTORY_STARTS_WITH_YOU')}</span>
                </p>
            </div>
        </div>
    );
};
