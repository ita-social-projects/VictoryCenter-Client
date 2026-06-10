import { useLayoutEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HistoryTimeline } from '../history-timeline/HistoryTimeline';
import styles from './HistoryHero.module.scss';

const DIRECTOR_CARD_H_MOBILE = 136; // 112px img + 4px gap + 20px caption
const DIRECTOR_CARD_H_TABLET = 160; // 136px img + 4px gap + 20px caption
const TIMELINE_PADDING_TOP = 12;
const MIN_GAP = 10;

export const HistoryHero = () => {
    const { t } = useTranslation('historyPage');
    const contentRef = useRef<HTMLDivElement>(null);
    const h1Ref = useRef<HTMLHeadingElement>(null);
    const descRef = useRef<HTMLParagraphElement>(null);
    const [safeTopAnchorLine, setSafeTopAnchorLine] = useState<number | undefined>(undefined);
    const [safeDirectorLine, setSafeDirectorLine] = useState<number | undefined>(undefined);

    useLayoutEffect(() => {
        const content = contentRef.current;
        const h1 = h1Ref.current;
        const desc = descRef.current;
        if (!content || !h1 || !desc) return;

        const update = () => {
            if (window.innerWidth >= 1440) {
                setSafeTopAnchorLine(undefined);
                setSafeDirectorLine(undefined);
                return;
            }
            const isTablet = window.innerWidth >= 768;

            const spanTopY = content.getBoundingClientRect().bottom + TIMELINE_PADDING_TOP;
            const minLine = spanTopY - 2 - h1.getBoundingClientRect().top + MIN_GAP;
            setSafeTopAnchorLine(Math.max(0, minLine));

            const directorPhotoH = isTablet ? DIRECTOR_CARD_H_TABLET : DIRECTOR_CARD_H_MOBILE;
            const contentBottom = content.getBoundingClientRect().bottom;
            const descBottom = desc.getBoundingClientRect().bottom;
            const safeMax = contentBottom + TIMELINE_PADDING_TOP - 2 - directorPhotoH - descBottom - MIN_GAP;
            setSafeDirectorLine(Math.max(0, safeMax));
        };

        const ro = new ResizeObserver(update);
        ro.observe(content);
        update();
        window.addEventListener('resize', update);

        return () => {
            ro.disconnect();
            window.removeEventListener('resize', update);
        };
    }, []);

    return (
        <section className={styles['hero-section']}>
            <div ref={contentRef} className={styles['hero-content']}>
                <h1 ref={h1Ref} className={styles.title}>
                    {t('TITLE_PLAIN_1')}
                    <em className={styles['title-italic']}>{t('TITLE_ITALIC_1')}</em>
                    <br />
                    {t('TITLE_PLAIN_2')}
                    <br />
                    {t('TITLE_PLAIN_3')}
                    <em className={styles['title-italic']}>{t('TITLE_ITALIC_2')}</em>
                    {t('TITLE_PLAIN_4')}
                </h1>
                <p ref={descRef} className={styles.description}>
                    {t('HERO_DESCRIPTION')}
                </p>
            </div>
            <HistoryTimeline safeTopAnchorLine={safeTopAnchorLine} safeDirectorLine={safeDirectorLine} />
        </section>
    );
};
