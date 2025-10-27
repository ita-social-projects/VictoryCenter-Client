import { ABOUT_US_DATA } from '../../../../../../const/public/about-us-page';
import { SupportCard } from '../support-card/SupportCard';

export const SupportSectionTablet = () => {
    const leftColumn = ABOUT_US_DATA.SUPPORT_DATA.filter((_, i) => i % 2 === 0);
    const rightColumn = ABOUT_US_DATA.SUPPORT_DATA.filter((_, i) => i % 2 === 1);

    return (
        <>
            <div className="main-values-title">
                <h2 className="support-title">{ABOUT_US_DATA.SUPPORT_TITLE}</h2>
            </div>

            <div className="support-columns">
                <div className="support-col left">
                    {leftColumn.map(({ IMG, ALT, DESCRIPTION }, index) => (
                        <SupportCard IMG={IMG} ALT={ALT} DESCRIPTION={DESCRIPTION} index={index} />
                    ))}
                </div>
                <div className="support-col right">
                    {rightColumn.map(({ IMG, ALT, DESCRIPTION }, index) => (
                        <SupportCard IMG={IMG} ALT={ALT} DESCRIPTION={DESCRIPTION} index={index} />
                    ))}
                </div>
            </div>
        </>
    );
};
