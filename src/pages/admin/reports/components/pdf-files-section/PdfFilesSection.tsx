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
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { ToastType } from '@/types/admin/toast';
import { PDF_FILES_SECTION_TEXT } from '@/const/admin/reports';

const EMPTY_SECTION = { title: '', description: '' };

export const PdfFilesSection = () => {
    const client = useAdminClient();
    const { addToast } = useToast();
    const [uploadedFiles, setUploadedFiles] = useState<PdfReportDto[]>([]);
    const [currentLanguage, setCurrentLanguage] = useState<'uk' | 'en'>('uk');
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchSection = useCallback(async () => {
        return PdfSectionApi.getPdfSection(client);
    }, [client]);

    const fetchFiles = useCallback(async () => {
        const data = await PdfReportsApi.getAll(client, { offset: 0, limit: 1000 });
        return data.items;
    }, [client]);

    const {
        data: sectionData,
        isLoading: isSectionLoading,
        refetch: refetchSection,
    } = useDataFetch({
        initialData: null,
        fetchHandler: fetchSection,
        autoFetchDependencies: [fetchSection],
    });

    const {
        data: fetchedFiles,
        isLoading: isFilesLoading,
        refetch: refetchFiles,
    } = useDataFetch<PdfReportDto[]>({
        initialData: [],
        fetchHandler: fetchFiles,
        autoFetchDependencies: [fetchFiles],
    });

    const handleUploaded = useCallback((newFile: PdfReportDto) => {
        setUploadedFiles((prev) => [...prev, newFile]);
    }, []);

    const handleSaveSection = useCallback(async () => {
        await refetchSection();
    }, [refetchSection]);

    const handleDeleteFile = useCallback(
        async (fileId: number) => {
            setIsDeleting(true);
            try {
                await PdfReportsApi.delete(client, fileId);
                addToast(PDF_FILES_SECTION_TEXT.DELETE_SUCCESS, ToastType.Success);
                await refetchFiles();
                setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
            } catch {
                addToast(PDF_FILES_SECTION_TEXT.DELETE_ERROR, ToastType.Error);
            } finally {
                setIsDeleting(false);
            }
        },
        [client, addToast, refetchFiles],
    );

    const handleViewFile = useCallback(
        async (file: PdfReportDto) => {
            try {
                const pdfBlob = await PdfReportsApi.fetchById(client, file.id);
                const blobUrl = URL.createObjectURL(pdfBlob);
                window.open(blobUrl, '_blank');
            } catch {
                addToast(PDF_FILES_SECTION_TEXT.VIEW_ERROR, ToastType.Error);
            }
        },
        [client, addToast],
    );

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
                <PdfSectionContentBlock content={sectionData ?? EMPTY_SECTION} onSave={handleSaveSection} />
            </div>
            <div className={styles['language-switcher-container']}>
                <LanguageSwitcherButtons currentLanguage={currentLanguage} onLanguageChange={setCurrentLanguage} />
            </div>
            <PdfDropzone onUploaded={handleUploaded} />
            <PdfFilesTable
                files={[...fetchedFiles, ...uploadedFiles]}
                onViewFile={handleViewFile}
                onDeleteFile={handleDeleteFile}
                isDeleting={isDeleting}
            />
        </div>
    );
};
