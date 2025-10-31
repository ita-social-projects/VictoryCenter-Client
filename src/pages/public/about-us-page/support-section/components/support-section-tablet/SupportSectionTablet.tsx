import { useMemo } from 'react';
import { ABOUT_US_DATA } from '../../../../../../const/public/about-us-page';
import { SupportCard } from '../support-card/SupportCard';
import { useTranslation } from 'react-i18next';

export const SupportSectionTablet = () => {
    const { t } = useTranslation('aboutUsPage');
    const supportData = t('SUPPORT_DATA', { returnObjects: true });

    const [leftColumn, rightColumn] = useMemo(() => {
        const allItemsWithIndex = supportData.map((item, index) => ({
            ...item,
            originalIndex: index,
        }));
        const left = allItemsWithIndex.filter((item) => item.originalIndex % 2 === 0);
        const right = allItemsWithIndex.filter((item) => item.originalIndex % 2 === 1);
        return [left, right];
    }, [supportData]);

    return (
        <div className="support-block">
            <div className="main-values-title">
                <h2 className="support-title">{t('SUPPORT_TITLE')}</h2>
            </div>
            <div className="support-columns">
                <div className="support-col left">
                    {leftColumn.map(({ ALT, DESCRIPTION, originalIndex }) => (
                        <SupportCard
                            key={ABOUT_US_DATA.SUPPORT_DATA[originalIndex].IMG}
                            img={ABOUT_US_DATA.SUPPORT_DATA[originalIndex].IMG}
                            alt={ALT}
                            description={DESCRIPTION}
                            index={originalIndex}
                        />
                    ))}
                </div>
                <div className="support-col right">
                    {rightColumn.map(({ ALT, DESCRIPTION, originalIndex }) => (
                        <SupportCard
                            key={ABOUT_US_DATA.SUPPORT_DATA[originalIndex].IMG}
                            img={ABOUT_US_DATA.SUPPORT_DATA[originalIndex].IMG}
                            alt={ALT}
                            description={DESCRIPTION}
                            index={originalIndex}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
