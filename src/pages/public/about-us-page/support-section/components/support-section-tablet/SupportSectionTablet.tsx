import { useMemo } from 'react';
import { ABOUT_US_DATA } from '../../../../../../const/public/about-us-page';
import { SupportCard } from '../support-card/SupportCard';

export const SupportSectionTablet = () => {
    const [leftColumn, rightColumn] = useMemo(() => {
        const allItemsWithIndex = ABOUT_US_DATA.SUPPORT_DATA.map((item, index) => ({
            ...item,
            originalIndex: index,
        }));
        const left = allItemsWithIndex.filter((item) => item.originalIndex % 2 === 0);
        const right = allItemsWithIndex.filter((item) => item.originalIndex % 2 === 1);
        return [left, right];
    }, []);

    return (
        <>
            <div className="main-values-title">
                <h2 className="support-title">{ABOUT_US_DATA.SUPPORT_TITLE}</h2>
            </div>

            <div className="support-columns">
                <div className="support-col left">
                    {leftColumn.map(({ IMG, ALT, DESCRIPTION, originalIndex }) => (
                        <SupportCard key={IMG} img={IMG} alt={ALT} description={DESCRIPTION} index={originalIndex} />
                    ))}
                </div>
                <div className="support-col right">
                    {rightColumn.map(({ IMG, ALT, DESCRIPTION, originalIndex }) => (
                        <SupportCard key={IMG} img={IMG} alt={ALT} description={DESCRIPTION} index={originalIndex} />
                    ))}
                </div>
            </div>
        </>
    );
};
