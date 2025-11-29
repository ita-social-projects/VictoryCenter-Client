import React from 'react';
import { useTranslation } from 'react-i18next';
import { ReportItem } from './components';
import { REPORTS_DATA } from '../../../../../utils/mock-data/public/reports-page';
import styles from './ReportsSection.module.scss';

export const ReportsSection: React.FC = () => {
    const { t } = useTranslation('reportsPage');

    return (
        <section className={styles.root}>
            <div className={styles.text}>
                <h2 className={styles.title}>{t('reports.title')}</h2>
                <p className={styles.description}>{t('reports.description')}</p>
            </div>
            <div className={styles.reportList}>
                {REPORTS_DATA.map(({ year, fileUrl }) => (
                    <ReportItem
                        key={year}
                        year={year}
                        fileUrl={fileUrl}
                        label={t('reports.itemLabel', { year })}
                        buttonLabel={t('actions.downloadPdf')}
                    />
                ))}
            </div>
        </section>
    );
};
