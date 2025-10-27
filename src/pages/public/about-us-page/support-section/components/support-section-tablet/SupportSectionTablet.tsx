import { ABOUT_US_DATA } from '../../../../../../const/public/about-us-page';
import { AboutUsContent } from '../../../../../../types/public/about-us-page';
import { SupportCard } from '../support-card/SupportCard';

export interface SupportSectionTabletProps {
    content: AboutUsContent[] | null;
}

export const SupportSectionTablet = ({ content }: SupportSectionTabletProps) => {
    if (!content) return null;

    const leftColumn = content.filter((_, i) => i % 2 === 0);
    const rightColumn = content.filter((_, i) => i % 2 === 1);

    return (
        <>
            <div className="main-values-title">
                <h2 className="support-title">{ABOUT_US_DATA.SUPPORT_TITLE}</h2>
            </div>

            <div className="support-columns">
                <div className="support-col left">
                    {leftColumn.map((item, index) => (
                        <SupportCard card={item} index={index * 2} />
                    ))}
                </div>
                <div className="support-col right">
                    {rightColumn.map((item, index) => (
                        <SupportCard card={item} index={index * 2 + 1} />
                    ))}
                </div>
            </div>
        </>
    );
};
