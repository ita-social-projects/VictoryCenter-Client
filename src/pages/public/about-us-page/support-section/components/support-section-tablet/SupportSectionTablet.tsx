import { useMemo } from 'react';
import { SupportCard } from '../support-card/SupportCard';
import { useTranslation } from 'react-i18next';
import { AboutUsContent } from '../../../../../../types/public/about-us-page';

export interface SupportSectionTabletProps {
    content: AboutUsContent[] | null;
    stylesModule: Record<string, string>;
}

export const SupportSectionTablet = ({ content, stylesModule }: SupportSectionTabletProps) => {
    const { t } = useTranslation('aboutUsPage');

    const [leftColumn, rightColumn] = useMemo(() => {
        if (!content) return [[], []];

        const allItemsWithIndex = content.map((item, index) => ({
            card: item,
            originalIndex: index,
        }));
        const left = allItemsWithIndex.filter((item) => item.originalIndex % 2 === 0);
        const right = allItemsWithIndex.filter((item) => item.originalIndex % 2 === 1);
        return [left, right];
    }, [content]);

    if (!content) return null;

    return (
        <div className={stylesModule['support-block']}>
            <div className={stylesModule['main-values-title']}>
                <h2>{t('SUPPORT_TITLE')}</h2>
            </div>
            <div className={stylesModule['support-columns']}>
                <div className={`${stylesModule['support-col']} ${stylesModule['left']}`}>
                    {leftColumn.map(({ card, originalIndex }) => (
                        <SupportCard key={card.id} card={card} index={originalIndex} stylesModule={stylesModule} />
                    ))}
                </div>
                <div className={`${stylesModule['support-col']} ${stylesModule['right']}`}>
                    {rightColumn.map(({ card, originalIndex }) => (
                        <SupportCard key={card.id} card={card} index={originalIndex} stylesModule={stylesModule} />
                    ))}
                </div>
            </div>
        </div>
    );
};
