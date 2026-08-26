import { useEffect, useState, useCallback, useRef } from 'react';
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
const FETCH_LIMIT = 50;

export const ReportsSection = () => {
    const { t } = useTranslation('reportsPage');
    const { currentLanguage } = useLocale();
    const [isExpanded, setIsExpanded] = useState(false);
    const [reports, setReports] = useState<PdfReportDto[]>([]);

    const activeLanguageIdRef = useRef<number | null>(null);

    const signalRConnection = useSignalR(process.env.REACT_APP_SIGNALR_PDF_REPORTS_URL || '');

    const fetchAllReports = useCallback(async (languageId: number) => {
        let offset = 0;
        let hasMore = true;
        let fetchedReports: PdfReportDto[] = [];

        try {
            while (hasMore) {
                const result = await PdfReportsApi.getAllByLanguageId(languageId, { offset, limit: FETCH_LIMIT });
                fetchedReports = [...fetchedReports, ...result.items];

                if (result.items.length < FETCH_LIMIT) {
                    hasMore = false;
                } else {
                    offset += FETCH_LIMIT;
                }
            }
            return fetchedReports;
        } catch (err) {
            return [];
        }
    }, []);

    useEffect(() => {
        let mounted = true;

        const initFetch = async () => {
            const languages = await localizationLanguagesDataFetch();
            const langCode = currentLanguage?.startsWith('en') ? 'en' : 'uk';
            const language = languages.find((l) => l.code === langCode);

            if (!language || !mounted) return;

            activeLanguageIdRef.current = language.id;
            const fetchedReports = await fetchAllReports(language.id);

            if (mounted) {
                setReports(fetchedReports);
            }
        };

        initFetch();

        return () => {
            mounted = false;
        };
    }, [currentLanguage, fetchAllReports]);

    useEffect(() => {
        if (!signalRConnection) return;

        let mounted = true;

        const handleCreated = (newReport: PdfReportDto) => {
            if (!mounted || activeLanguageIdRef.current !== newReport.languageId) return;
            setReports((prev) => [newReport, ...prev]);
        };

        const handleUpdated = (updatedReport: PdfReportDto) => {
            if (!mounted || activeLanguageIdRef.current !== updatedReport.languageId) return;
            setReports((prev) => prev.map((r) => (r.id === updatedReport.id ? updatedReport : r)));
        };

        const handleDeleted = (deletedId: number) => {
            if (!mounted) return;
            setReports((prev) => prev.filter((r) => r.id !== deletedId));
        };

        const handleReordered = async (languageId: number) => {
            if (!mounted || activeLanguageIdRef.current !== languageId) return;
            const updatedReports = await fetchAllReports(languageId);
            if (mounted) {
                setReports(updatedReports);
            }
        };

        signalRConnection.on('PdfReportCreated', handleCreated);
        signalRConnection.on('PdfReportUpdated', handleUpdated);
        signalRConnection.on('PdfReportDeleted', handleDeleted);
        signalRConnection.on('PdfReportsReordered', handleReordered);

        return () => {
            mounted = false;
            signalRConnection.off('PdfReportCreated', handleCreated);
            signalRConnection.off('PdfReportUpdated', handleUpdated);
            signalRConnection.off('PdfReportDeleted', handleDeleted);
            signalRConnection.off('PdfReportsReordered', handleReordered);
        };
    }, [signalRConnection, fetchAllReports]);

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
                        label={report?.name?.replace(/\.pdf$/i, '') || 'Unnamed Report'}
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
