import React from 'react';
import './IntroSection.scss';
import background from '../../../../../assets/partners-page-images/horses.png';
import { PARTNERS_PAGE_SUBTITLE, PARTNERS_PAGE_TITLE } from '../../../../../const/public/partners-page';

export const IntroSection = () => {
    return (
        <div className="partners-intro-block">
            <img src={background} className="background-img-partners" alt="Horses" />
            <div className="content-overlay">
                <h1 className="main-title">
                    <div className="title-line">
                        {PARTNERS_PAGE_TITLE.FIRST_LINE.REGULAR}
                        <span className="bold-text">{PARTNERS_PAGE_TITLE.FIRST_LINE.BOLD}</span>
                    </div>
                    <div className="title-line">
                        <span className="bold-text">{PARTNERS_PAGE_TITLE.SECOND_LINE.BOLD_START}</span>
                        {PARTNERS_PAGE_TITLE.SECOND_LINE.REGULAR}
                        <span className="bold-text">{PARTNERS_PAGE_TITLE.SECOND_LINE.BOLD_END}</span>
                    </div>
                </h1>
                <p className="subtitle">{PARTNERS_PAGE_SUBTITLE}</p>
            </div>
        </div>
    );
};
