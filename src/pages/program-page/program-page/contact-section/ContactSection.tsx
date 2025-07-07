import React from "react";
import { PROGRAM_PROMPT, TEXT_US, CONTACT } from "../../../../const/program-page/program-page";
import background from "../../../../assets/program_page_images/videos/background.mp4";
import "./contact-section.scss";

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
