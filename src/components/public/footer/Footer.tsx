import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ReactComponent as ArrowUpIcon } from '@/assets/icons/arrow-up-right.svg';
import { ReactComponent as PhoneIcon } from '@/assets/icons/phone.svg';
import { ReactComponent as MailIcon } from '@/assets/icons/mail.svg';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import { useTranslation } from 'react-i18next';
import './Footer.scss';

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
        <div className="footer-content">
            <div className="main-block">
                <div className="email-field">
                    <span className="title">{t('STAY_UP_TO_DATE_WITH_THE_NEWS')}</span>
                    <div className="input-block">
                        <input
                            type="email"
                            placeholder={t('ENTER_YOUR_EMAIL')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button onClick={handleClick} className="subscribe-btn" aria-label={t('SIGN_UP')}>
                            <ArrowUpIcon className="arrow-up-icon" />
                        </button>
                    </div>
                </div>

                <div className="menu">
                    <span className="title">{t('MENU')}</span>
                    <Link to={PUBLIC_ROUTES.REPORTS.FULL}>{t('REPORTING')}</Link>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} className="disable">
                        {t('HOW_TO_SUPPORT')}
                    </Link>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} className="disable">
                        {t('STORIES_OF_VICTORIES')}
                    </Link>
                </div>

                <div className="about-us">
                    <span className="title">{t('ABOUT_US')}</span>
                    <Link to={PUBLIC_ROUTES.ABOUT_US.FULL}>{t('ABOUT_US')}</Link>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} className="disable">
                        {t('OUR_HISTORY')}
                    </Link>
                    <Link to={PUBLIC_ROUTES.TEAM.FULL}>{t('OUR_TEAM')}</Link>
                    <Link to={PUBLIC_ROUTES.PARTNERS.FULL}>{t('PARTNERS')}</Link>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} className="disable">
                        {t('EVENTS_AND_NEWS')}
                    </Link>
                </div>

                <div className="hippotherapy">
                    <span className="title">{t('HIPPOTHERAPY')}</span>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} className="disable">
                        {t('WHAT_IS_HIPPOTHERAPY')}
                    </Link>
                    <Link to={PUBLIC_ROUTES.PROGRAMS.FULL}>{t('PROGRAMS')}</Link>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} className="disable">
                        {t('PROGRAMS_SESSIONS')}
                    </Link>
                </div>
            </div>

            <div className="contact-block">
                <div className="main-contacts">
                    <button className="contact-item" onClick={() => copyToClipboard(t('EMAIL'))}>
                        <MailIcon /> {t('EMAIL')}
                    </button>
                    <button className="contact-item" onClick={() => copyToClipboard(t('PHONE'))}>
                        <PhoneIcon /> {t('PHONE')}
                    </button>
                </div>
                <div className="social-media">
                    <button className="contact-item" onClick={handleFacebookClick}>
                        Facebook
                    </button>
                    <button className="contact-item" onClick={handleTelegramClick}>
                        Telegram
                    </button>
                    <button className="contact-item" onClick={handleInstagramClick}>
                        Instagram
                    </button>
                </div>
            </div>
            <div className="scrolling-text-wrapper">
                <p className="scrolling-text">
                    <span>{t('VICTORY_STARTS_WITH_YOU')} </span>
                    <span> {t('VICTORY_STARTS_WITH_YOU')}</span>
                </p>
            </div>
        </div>
    );
};
