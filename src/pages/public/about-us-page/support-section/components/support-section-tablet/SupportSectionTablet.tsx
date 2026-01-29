import { useMemo } from 'react';
import { SupportCard } from '../support-card/SupportCard';
import { useTranslation } from 'react-i18next';
import { AboutUsContent } from '@/types/public/about-us-page';
import styles from './SupportSectionTablet.module.scss';

export interface SupportSectionTabletProps {
    content: AboutUsContent[] | null;
}

export const SupportSectionTablet = ({ content }: SupportSectionTabletProps) => {
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
        <div className={styles.root}>
            <div className={styles.title}>
                <h2>{t('SUPPORT_TITLE')}</h2>
            </div>
            <div className={styles.columns}>
                <div className={styles.column}>
                    {leftColumn.map(({ card, originalIndex }) => (
                        <SupportCard key={card.id} card={card} index={originalIndex} />
                    ))}
                </div>
                <div className={styles.column}>
                    {rightColumn.map(({ card, originalIndex }) => (
                        <SupportCard key={card.id} card={card} index={originalIndex} />
                    ))}
                </div>
            </div>
        </div>
    );
};
