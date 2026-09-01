import { Link } from 'react-router-dom';
import { ReactComponent as VictoryCenterLogo } from '@/assets/icons/logo-with-text.svg';
import { ReactComponent as PhoneIcon } from '@/assets/icons/phone.svg';
import { ReactComponent as MailIcon } from '@/assets/icons/mail.svg';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';
import {
    getPublicCompanyProfile,
    PublicCompanyProfileDto,
} from '@/services/api/public/company-profile/company-profile-api';
import './Footer.scss';

const PLATFORM_LABEL: Record<number, string> = {
    0: 'Instagram',
    1: 'Facebook',
    2: 'Telegram',
    3: 'YouTube',
    4: 'X',
    5: 'WhatsApp',
    6: 'LinkedIn',
    7: 'Viber',
};

export const Footer = () => {
    const { t, i18n } = useTranslation('footer');
    const [profile, setProfile] = useState<PublicCompanyProfileDto | null>(null);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const data = await getPublicCompanyProfile();
                if (mounted) setProfile(data);
            } catch {
                // Fallback to i18n footer defaults if Company Profile is unavailable.
                // Footer should never block page rendering due to API issues.
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    const email = profile?.contacts?.email || t('EMAIL');
    const phone = profile?.contacts?.phone || t('PHONE');

    const motto = useMemo(() => {
        const locale = i18n.language?.startsWith('en') ? 'en' : 'uk';
        return (
            profile?.contacts?.localizations?.find((l) => l.localizationInfoDto?.code === locale)?.motto ||
            profile?.contacts?.motto ||
            t('VICTORY_STARTS_WITH_YOU')
        );
    }, [profile, i18n.language, t]);

    const socialLinks = profile?.socialLinks ?? [];

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="footer-content">
            <div className="main-block">
                <div className="logo-container">
                    <Link to="/">
                        <VictoryCenterLogo className="logo" />
                    </Link>
                </div>

                <div className="menu">
                    <span className="title">{t('MENU')}</span>
                    <Link to={PUBLIC_ROUTES.REPORTS.FULL}>{t('REPORTING')}</Link>
                    <Link to={PUBLIC_ROUTES.SUPPORT_US.FULL}>{t('HOW_TO_SUPPORT')}</Link>
                    <Link to={PUBLIC_ROUTES.STORIES_OF_VICTORIES.FULL}>{t('STORIES_OF_VICTORIES')}</Link>
                </div>

                <div className="about-us">
                    <span className="title">{t('ABOUT_US')}</span>
                    <Link to={PUBLIC_ROUTES.ABOUT_US.FULL}>{t('ABOUT_US')}</Link>
                    <Link to={PUBLIC_ROUTES.HISTORY.FULL}>{t('OUR_HISTORY')}</Link>
                    <Link to={PUBLIC_ROUTES.TEAM.FULL}>{t('OUR_TEAM')}</Link>
                    <Link to={PUBLIC_ROUTES.PARTNERS.FULL}>{t('PARTNERS')}</Link>
                    <Link to={PUBLIC_ROUTES.EVENTS_AND_NEWS.FULL}>{t('EVENTS_AND_NEWS')}</Link>
                </div>

                <div className="hippotherapy">
                    <span className="title">{t('HIPPOTHERAPY')}</span>
                    <Link to={PUBLIC_ROUTES.HIPPOTHERAPY.FULL}>{t('WHAT_IS_HIPPOTHERAPY')}</Link>
                    <Link to={PUBLIC_ROUTES.PROGRAMS.FULL}>{t('PROGRAMS')}</Link>
                </div>
            </div>

            <div className="contact-block">
                <div className="main-contacts">
                    <button className="contact-item" onClick={() => copyToClipboard(email)}>
                        <MailIcon /> {email}
                    </button>
                    <button className="contact-item" onClick={() => copyToClipboard(phone)}>
                        <PhoneIcon /> {phone}
                    </button>
                </div>

                <div className="social-media">
                    {socialLinks.map((link, idx) => (
                        <button
                            key={`${link.socialPlatform}-${idx}`}
                            className="contact-item"
                            onClick={() => window.open(link.url, '_blank', 'noopener,noreferrer')}
                        >
                            {PLATFORM_LABEL[link.socialPlatform] ?? `Social ${link.socialPlatform}`}
                        </button>
                    ))}
                </div>
            </div>

            <div className="scrolling-text-wrapper">
                <p className="scrolling-text">
                    <span>{motto} </span>
                    <span> {motto}</span>
                </p>
            </div>
        </div>
    );
};
