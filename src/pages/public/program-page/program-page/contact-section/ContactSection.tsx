import React from 'react';
import background from '../../../../assets/videos/public/programs-page/contact_us_background.mp4';
import './ContactSection.scss';
import { CONTACT, PROGRAM_PROMPT, TEXT_US } from '../../../../../const/public/programs-page';

export const ContactSection: React.FC = () => {
    return (
        <div className="contact-us-block">
            <video autoPlay muted loop playsInline aria-hidden="true">
                <source src={background} type="video/mp4" />
            </video>
            <div className="contact-us-info">
                <h2 className="contact-title">{PROGRAM_PROMPT}</h2>
                <div className="contact-button">
                    <h4>{TEXT_US}</h4>
                    <button type="button" aria-label="Звʼязатись з нами">
                        {CONTACT}
                    </button>
                </div>
            </div>
        </div>
    );
};
