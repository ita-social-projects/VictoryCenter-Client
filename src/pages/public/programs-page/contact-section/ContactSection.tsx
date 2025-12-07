import React from 'react';
import background from '@assets/videos/public/programs-page/contact_us_background.mp4';
import { useTranslation } from 'react-i18next';
import './ContactSection.scss';

export const ContactSection: React.FC = () => {
    const { t } = useTranslation('programsPage');

    return (
        <div className="contact-us-block">
            <video autoPlay muted loop playsInline aria-hidden="true">
                <source src={background} type="video/mp4" />
            </video>
            <div className="contact-us-info">
                <h2 className="contact-title">{t('PROGRAM_PROMPT')}</h2>
                <div className="contact-button">
                    <h4>{t('TEXT_US')}</h4>
                    <button type="button" aria-label="Звʼязатись з нами">
                        {t('CONTACT')}
                    </button>
                </div>
            </div>
        </div>
    );
};
