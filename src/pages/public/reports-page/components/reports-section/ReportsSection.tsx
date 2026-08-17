import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReportItem } from './report-item';
import { Button } from '@/components/public/ui/button';
import { useLocale } from '@/hooks/common/use-locale/useLocale';
import { localizationLanguagesDataFetch } from '@/services/api/public/localization/languages/languages-api';
import { PdfReportsApi } from '@/services/api/admin/reports/pdf-reports/pdf-reports-api';
import { PdfReportDto } from '@/types/admin/pdf-section';
import { useSignalR } from '@/hooks/public/SignalR/useSignalR';
import styles from './ReportsSection.module.scss';

const INITIAL_VISIBLE_COUNT = 2;

export const ReportsSection = () => {
    const { t } = useTranslation('reportsPage');
    const { currentLanguage } = useLocale();
    const [isExpanded, setIsExpanded] = useState(false);
    const [reports, setReports] = useState<PdfReportDto[]>([]);

    const signalRConnection = useSignalR(process.env.SIGNALR_PDF_REPORTS_URL || 'https://localhost:5001/hubs/reports');

    useEffect(() => {
        let mounted = true;
        const fetchReports = async () => {
            try {
                const languages = await localizationLanguagesDataFetch();
                const langCode = currentLanguage?.startsWith('en') ? 'en' : 'uk';
                const language = languages.find((l) => l.code === langCode);
                if (!language || !mounted) return;
                const result = await PdfReportsApi.getAllByLanguageId(language.id, { offset: 0, limit: 1000 });
                if (mounted) setReports(result.items);
            } catch {}
        };
        fetchReports();
        return () => {
            mounted = false;
        };
    }, [currentLanguage]);

    useEffect(() => {
        if (!signalRConnection) return;

        const handlePdfCreated = async (updatedLanguageId: number) => {
            try {
                const languages = await localizationLanguagesDataFetch();
                const langCode = currentLanguage?.startsWith('en') ? 'en' : 'uk';
                const language = languages.find((l) => l.code === langCode);

                if (language && language.id === updatedLanguageId) {
                    const result = await PdfReportsApi.getAllByLanguageId(language.id, { offset: 0, limit: 1000 });
                    setReports(result.items);
                }
            } catch (err) {
                console.error('Failed to refetch reports on SignalR event', err);
            }
        };

        signalRConnection.on('PdfReportAction', handlePdfCreated);

        return () => {
            signalRConnection.off('PdfReportAction', handlePdfCreated);
        };
    }, [signalRConnection, currentLanguage]);

    const hasOverflow = reports.length > INITIAL_VISIBLE_COUNT;
    const visibleReports = hasOverflow && !isExpanded ? reports.slice(0, INITIAL_VISIBLE_COUNT) : reports;

    return (
        <section className={styles.root}>
            <div className={styles.text}>
                <h2 className={styles.title}>{t('reports.title')}</h2>
                <p className={styles.description}>{t('reports.description')}</p>
            </div>

            <div className={styles.list}>
                {visibleReports.map((report) => (
                    <ReportItem
                        key={report.id}
                        fileUrl={PdfReportsApi.getPublicFileUrl(report.id)}
                        label={report.name.replace(/\.pdf$/i, '')}
                        buttonLabel={t('actions.downloadPdf')}
                    />
                ))}

                {hasOverflow && (
                    <div className={styles.toggle}>
                        <Button variant="primary-dark" onClick={() => setIsExpanded((prev) => !prev)}>
                            {isExpanded ? t('reports.showLess') : t('reports.showMore')}
                        </Button>
                    </div>
                )}
            </div>
        </section>
    );
};
