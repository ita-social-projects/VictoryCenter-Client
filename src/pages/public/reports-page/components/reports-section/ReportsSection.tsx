import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { REPORTS_DATA } from '@/utils/mock-data/public/reports-page';
import { ReportItem } from './report-item';
import { Button } from '@/components/public/ui/button';
import styles from './ReportsSection.module.scss';

const INITIAL_VISIBLE_COUNT = 5;

export const ReportsSection = () => {
    const { t } = useTranslation('reportsPage');
    const [isExpanded, setIsExpanded] = useState(false);

    const hasOverflow = REPORTS_DATA.length > INITIAL_VISIBLE_COUNT;
    const visibleReports = hasOverflow && !isExpanded ? REPORTS_DATA.slice(0, INITIAL_VISIBLE_COUNT) : REPORTS_DATA;

    const handleToggle = () => {
        setIsExpanded((prev) => !prev);
    };

    return (
        <section className={styles.root}>
            <div className={styles.text}>
                <h2 className={styles.title}>{t('reports.title')}</h2>
                <p className={styles.description}>{t('reports.description')}</p>
            </div>

            <div className={styles.list}>
                {visibleReports.map(({ year, fileUrl }) => (
                    <ReportItem
                        key={year}
                        fileUrl={fileUrl}
                        label={t('reports.itemLabel', { year })}
                        buttonLabel={t('actions.downloadPdf')}
                    />
                ))}

                {hasOverflow && (
                    <div className={styles.toggle}>
                        <Button variant="primary-dark" onClick={handleToggle}>
                            {isExpanded ? t('reports.showLess') : t('reports.showMore')}
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
};
