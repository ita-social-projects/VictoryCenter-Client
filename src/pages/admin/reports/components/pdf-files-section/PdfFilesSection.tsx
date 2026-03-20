import { useCallback, useState } from 'react';
import { PdfSectionContentBlock } from './components/pdf-section-content-block/PdfSectionContentBlock';
import { PdfFilesTable } from './components/pdf-files-table/PdfFilesTable';
import styles from './PdfFilesSection.module.scss';
import { LanguageSwitcherButtons } from './components/language-switcher-buttons/LanguageSwitcherButtons';
import { PdfSectionApi } from '@/services/api/admin/reports/pdf-section/pdf-section-api';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { PdfReportDto } from '@/types/admin/pdf-section';
import { PdfReportsApi } from '@/services/api/admin/reports/pdf-reports/pdf-reports-api';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { InlineLoader } from '@/components/common/inline-loader/InlineLoader';
import { PdfDropzone } from './components/pdf-dropzone/PdfDropzone';

export const PdfFilesSection = () => {
    const client = useAdminClient();
    const [uploadedFiles, setUploadedFiles] = useState<PdfReportDto[]>([]);

    const fetchSection = useCallback(async () => {
        return PdfSectionApi.getPdfSection(client);
    }, [client]);

    const fetchFiles = useCallback(async () => {
        const data = await PdfReportsApi.getAll(client, { offset: 0, limit: 1000 });
        return data.items;
    }, [client]);

    const { data: sectionData, isLoading: isSectionLoading } = useDataFetch({
        initialData: null,
        fetchHandler: fetchSection,
        autoFetchDependencies: [fetchSection],
    });

    const { data: fetchedFiles, isLoading: isFilesLoading } = useDataFetch<PdfReportDto[]>({
        initialData: [],
        fetchHandler: fetchFiles,
        autoFetchDependencies: [fetchFiles],
    });

    const handleUploaded = useCallback((newFile: PdfReportDto) => {
        setUploadedFiles((prev) => [...prev, newFile]);
    }, []);

    if (isSectionLoading || isFilesLoading) {
        return (
            <div className={styles.loader}>
                <InlineLoader size={3} />
            </div>
        );
    }

    return (
        <div className={styles.root}>
            <div className={styles['top-section']}>
                <PdfSectionContentBlock content={sectionData ?? { title: '', description: '' }} />
            </div>
            <div className={styles['language-switcher-container']}>
                <LanguageSwitcherButtons />
            </div>
            <PdfDropzone onUploaded={handleUploaded} />
            <PdfFilesTable files={[...fetchedFiles, ...uploadedFiles]} onViewFile={() => {}} />
        </div>
    );
};
