import React from 'react';
import { DonatePageIntro } from './donate-page-intro/DonatePageIntro';
import { DonateSection } from './donate-section/DonateSection';
import './DonatePage.scss';
import { RightSection } from './RightSection/RightSection';

export const DonatePage = () => {
    return (
        <div className="donatePage">
            <DonatePageIntro />
            <div className="donatePageContent">
                <div className="stickyBlock">
                    <DonateSection />
                </div>
                <RightSection />
            </div>
        </div>
    );
};
