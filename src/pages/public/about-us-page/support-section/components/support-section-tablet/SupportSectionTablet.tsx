import { useMemo } from 'react';
import { ABOUT_US_DATA } from '../../../../../../const/public/about-us-page';
import { SupportCard } from '../support-card/SupportCard';
import { useTranslation } from 'react-i18next';
import { AboutUsContent } from '../../../../../../types/public/about-us-page';

export interface SupportSectionTabletProps {
    content: AboutUsContent[] | null;
}

export const SupportSectionTablet = ({ content }: SupportSectionTabletProps) => {
    const { t } = useTranslation('aboutUsPage');

    if (!content) return null;

    const [leftColumn, rightColumn] = useMemo(() => {
        const allItemsWithIndex = content.map((item, index) => ({
            ...item,
            originalIndex: index,
        }));
        const left = allItemsWithIndex.filter((item) => item.originalIndex % 2 === 0);
        const right = allItemsWithIndex.filter((item) => item.originalIndex % 2 === 1);
        return [left, right];
    }, [content]);

    return (
        <div className="support-block">
            <div className="main-values-title">
                <h2 className="support-title">{t('SUPPORT_TITLE')}</h2>
            </div>
            <div className="support-columns">
                <div className="support-col left">
                    {leftColumn.map((item, originalIndex) => (
                        <SupportCard key={item.id} card={item} index={originalIndex} />
                    ))}
                </div>
                <div className="support-col right">
                    {rightColumn.map((item, originalIndex) => (
                        <SupportCard key={item.id} card={item} index={originalIndex} />
                    ))}
                </div>
            </div>
        </div>
    );
};
