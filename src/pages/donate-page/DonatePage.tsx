import { DonatePageIntro } from './donate-page-intro/DonatePageIntro';
import { DonateSection } from './donate-section/DonateSection';
import './DonatePage.scss';
import { RightSection } from './RightSection/RightSection';

export const DonatePage = () => {
    return (
        <div className="donatePage">
            <DonatePageIntro />
            <div className="donatePageContent">
                <DonateSection />
                <RightSection />
            </div>
        </div>
    );
};
