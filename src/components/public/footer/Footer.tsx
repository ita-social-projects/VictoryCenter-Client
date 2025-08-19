import './Footer.scss';
import { useState } from 'react';
import { Link } from 'react-router';
import arrowIcon from '../../../assets/icons/arrow-up-right.svg';
import phoneIcon from '../../../assets/icons/phone.svg';
import mailIcon from '../../../assets/icons/mail.svg';
import {
    ABOUT_US,
    HIPPOTHERAPY,
    MENU,
    REPORTING,
    STORE,
    HOW_TO_SUPPORT,
    STORIES_OF_VICTORIES,
    OUR_HISTORY,
    OUR_TEAM,
    PARTNERS,
    EVENTS_AND_NEWS,
    PROGRAMS,
    PROGRAMS_SESSIONS,
    VICTORY_STARTS_WITH_YOU,
    STAY_UP_TO_DATE_WITH_THE_NEWS,
    ENTER_YOUR_EMAIL,
    SIGN_UP,
    WHAT_IS_HIPPOTHERAPY,
    EMAIL,
    PHONE,
    FACEBOOK,
    INSTAGRAM,
    TELEGRAM,
} from '../../../const/public/footer';
import { PUBLIC_ROUTES } from '../../../const/public/routes';

export const Footer = () => {
    const [email, setEmail] = useState('');

    const handleClick = () => {
        setEmail('');
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };
    const handleFacebookClick = () => {
        window.open(FACEBOOK, '_blank', 'noopener,noreferrer');
    };

    const handleTelegramClick = () => {
        window.open(TELEGRAM, '_blank', 'noopener,noreferrer');
    };

    const handleInstagramClick = () => {
        window.open(INSTAGRAM, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="footer-content">
            <div className="main-block">
                <div className="email_field">
                    <span className="title">{STAY_UP_TO_DATE_WITH_THE_NEWS}</span>
                    <div className="input_block">
                        <input
                            type="email"
                            placeholder={ENTER_YOUR_EMAIL}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button onClick={handleClick} className="subscribe-btn" aria-label={SIGN_UP}>
                            <img src={arrowIcon} alt={SIGN_UP} />
                        </button>
                    </div>
                </div>

                <div className="menu">
                    <span className="title">{MENU}</span>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} className="disable">
                        {REPORTING}
                    </Link>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} className="disable">
                        {STORE}
                    </Link>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} className="disable">
                        {HOW_TO_SUPPORT}
                    </Link>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} className="disable">
                        {STORIES_OF_VICTORIES}
                    </Link>
                </div>

                <div className="about_us">
                    <span className="title">{ABOUT_US}</span>
                    <Link to={PUBLIC_ROUTES.ABOUT_US.FULL}>{ABOUT_US}</Link>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} className="disable">
                        {OUR_HISTORY}
                    </Link>
                    <Link to={PUBLIC_ROUTES.TEAM.FULL}>{OUR_TEAM}</Link>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} className="disable">
                        {PARTNERS}
                    </Link>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} className="disable">
                        {EVENTS_AND_NEWS}
                    </Link>
                </div>

                <div className="hippotherapy">
                    <span className="title">{HIPPOTHERAPY}</span>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} className="disable">
                        {WHAT_IS_HIPPOTHERAPY}
                    </Link>
                    <Link to={PUBLIC_ROUTES.PROGRAMS.FULL}>{PROGRAMS}</Link>
                    <Link to={PUBLIC_ROUTES.MOCK.FULL} className="disable">
                        {PROGRAMS_SESSIONS}
                    </Link>
                </div>
            </div>

            <div className="contact-block">
                <div className="main_contacts">
                    <button className="contact-item" onClick={() => copyToClipboard(EMAIL)}>
                        <img src={mailIcon} alt="mail" /> {EMAIL}
                    </button>
                    <button className="contact-item" onClick={() => copyToClipboard(PHONE)}>
                        <img src={phoneIcon} alt="phone" /> {PHONE}
                    </button>
                </div>
                <div className="social_media">
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
                    <span>{VICTORY_STARTS_WITH_YOU} </span>
                    <span> {VICTORY_STARTS_WITH_YOU}</span>
                </p>
            </div>
        </div>
    );
};
