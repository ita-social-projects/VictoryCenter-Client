import React from 'react';
import { DonatePageIntro } from './donate-page-intro/DonatePageIntro';
import { DonateSection } from './donate-section/DonateSection';
import './DonatePage.scss';
import { RightSection } from './right-section/RightSection';
import { PAGE_SLUGS } from '../../../const/public/faq';
import { FaqSection } from '../../../components/public/faq-section/FaqSection';

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
            <FaqSection slug={PAGE_SLUGS.DONATE} />
        </div>
    );
};
