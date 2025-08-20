import React from 'react';
import './OutroSection.scss';
import outro from '../../../../../assets/partners-page-images/outro.mp4';
import { OUTRO } from '../../../../../const/partners-page/partners-page';

export const OutroSection = () => {
    return (
        <div className="video-background-container">
            <video autoPlay muted loop playsInline className="background-video">
                <source src={outro} type="video/mp4" />
            </video>

            <div className="quote-overlay-partners">
                <h1 className="video-text-partners">
                    {OUTRO.TITLE.FIRST_LINE} <br />
                    {OUTRO.TITLE.SECOND_LINE}
                </h1>
                <div>
                    <p className="video-description">{OUTRO.TEXT}</p>
                    <div className="video-buttons">
                        <button className="btn-primary">{OUTRO.BUTTON_BECOME_SUPPORT_TEXT}</button>
                        <button className="btn-secondary">{OUTRO.BUTTON_SUPPORT_TEXT}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
