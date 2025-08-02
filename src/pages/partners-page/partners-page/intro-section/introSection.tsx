import React from 'react';
import './intro-section.scss';
import background from '../../../../assets/partners-page-images/horses.png';
import { PARTNERS_PAGE_SUBTITLE } from '../../../../const/partners-page/partners-page';

export const IntroSection: React.FC = () => {
    return (
        <div className="partners-intro-block">
            <img src={background} className="background-img" alt="Horses" />
            <div className="content-overlay">
                <h1 className="main-title">
                    <div className="title-line">
                        МИ
                        <span className="bold-text"> НЕ ОДНІ.</span>
                    </div>
                    <div className="title-line">
                        <span className="bold-text">І ЦЕ</span> НАША <span className="bold-text"> СИЛА </span>
                    </div>
                </h1>
                <p className="subtitle">{PARTNERS_PAGE_SUBTITLE}</p>
            </div>
        </div>
    );
};
