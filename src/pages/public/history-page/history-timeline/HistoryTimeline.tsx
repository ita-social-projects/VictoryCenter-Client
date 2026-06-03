import { useTranslation } from 'react-i18next';
import { TIMELINE_DATES, HIGHLIGHTED_DATES } from '@/const/public/history-page';
import { LineConfig } from '@/types/public/history-page';
import styles from './HistoryTimeline.module.scss';

const SHOW_FROM_CLASS: Record<LineConfig['showFrom'], string> = {
    all: styles['date--line-all'],
    tablet: styles['date--line-tablet'],
    desktop: styles['date--line-desktop'],
};

const getLineClass = (config: LineConfig): string => {
    const visClass = SHOW_FROM_CLASS[config.showFrom];
    return config.topAnchor ? `${visClass} ${styles['date--line-top-anchor']}` : visClass;
};

interface HistoryTimelineProps {
    safeTopAnchorLine?: number;
    safeDirectorLine?: number;
}

export const HistoryTimeline = ({ safeTopAnchorLine, safeDirectorLine }: HistoryTimelineProps) => {
    const { t } = useTranslation('historyPage');

    return (
        <div className={styles.timeline}>
            <div className={styles['dates-row']}>
                {TIMELINE_DATES.map((date) => {
                    const config = HIGHLIGHTED_DATES[date];
                    const isActive = Boolean(config);
                    return (
                        <span
                            key={date}
                            className={
                                isActive
                                    ? `${styles.date} ${styles['date--active']} ${getLineClass(config)}`
                                    : styles.date
                            }
                            style={
                                isActive
                                    ? ({
                                          '--line-mobile': `${config.mobile}px`,
                                          '--line-xl': `${config.xl}px`,
                                          ...(config.topAnchor && safeTopAnchorLine !== undefined
                                              ? { '--safe-topanchor-line': `${safeTopAnchorLine}px` }
                                              : {}),
                                          ...(!config.topAnchor && config.photo && safeDirectorLine !== undefined
                                              ? { '--safe-director-line': `${safeDirectorLine}px` }
                                              : {}),
                                      } as React.CSSProperties)
                                    : undefined
                            }
                        >
                            {isActive && <span className={styles['date-line']} />}
                            {isActive && config.photo && (
                                <div
                                    className={`${styles['photo-card']} ${
                                        config.side === 'right'
                                            ? styles['photo-card--right']
                                            : styles['photo-card--left']
                                    }`}
                                    style={
                                        {
                                            '--photo-w-desktop': `${config.photo.width}px`,
                                            '--photo-h-desktop': `${config.photo.height}px`,
                                            ...(config.photo.tabletWidth !== undefined && {
                                                '--photo-w-tablet': `${config.photo.tabletWidth}px`,
                                            }),
                                            ...(config.photo.tabletHeight !== undefined && {
                                                '--photo-h-tablet': `${config.photo.tabletHeight}px`,
                                            }),
                                            ...(config.photo.mobileWidth !== undefined && {
                                                '--photo-w-mobile': `${config.photo.mobileWidth}px`,
                                            }),
                                            ...(config.photo.mobileHeight !== undefined && {
                                                '--photo-h-mobile': `${config.photo.mobileHeight}px`,
                                            }),
                                            '--img-offset-desktop': `${config.photo.offsetX ?? 0}px`,
                                        } as React.CSSProperties
                                    }
                                >
                                    <img
                                        src={config.photo.src}
                                        alt={`${t(config.photo.nameKey)}, ${t(config.photo.roleKey)}`}
                                        className={styles['photo-img']}
                                    />
                                    <div className={styles['photo-caption-row']}>
                                        {config.side === 'left' && <span className={styles['photo-dot']} />}
                                        <p className={styles['photo-caption']}>
                                            {t(config.photo.nameKey)}, {t(config.photo.roleKey)}
                                        </p>
                                        {config.side === 'right' && <span className={styles['photo-dot']} />}
                                    </div>
                                </div>
                            )}
                            {date}
                        </span>
                    );
                })}
                <span className={styles['dates-ellipsis']}>…</span>
            </div>
        </div>
    );
};
