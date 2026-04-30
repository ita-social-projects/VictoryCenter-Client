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
import { useLocalizationToolkit } from '@/hooks/admin/use-localization-toolkit/useLocalizationToolkit';

const EMPTY_SECTION = { title: '', description: '', localizations: [] };

export const PdfFilesSection = () => {
    const client = useAdminClient();
    const { addToast } = useToast();
    const [uploadedFiles, setUploadedFiles] = useState<PdfReportDto[]>([]);
    const [currentLanguage, setCurrentLanguage] = useState<'uk' | 'en'>('uk');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);

    const { translationLanguages } = useLocalizationToolkit({
        setErrorState: useCallback(() => {}, []),
    });

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
                setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
                addToast(PDF_FILES_SECTION_TEXT.DELETE_SUCCESS, ToastType.Success);
            } catch {
                addToast(PDF_FILES_SECTION_TEXT.DELETE_ERROR, ToastType.Error);
            } finally {
                setIsDeleting(false);
            }

            try {
                await refetchFiles();
            } catch {}
        },
        [client, addToast, refetchFiles],
    );

    const handleViewFile = useCallback(
        async (file: PdfReportDto) => {
            try {
                const pdfBlob = await PdfReportsApi.fetchById(client, file.id);
                const blobUrl = URL.createObjectURL(pdfBlob);
                const openedWindow = window.open(blobUrl, '_blank');
                if (openedWindow) {
                    setTimeout(() => {
                        URL.revokeObjectURL(blobUrl);
                    }, 1500);
                }
            } catch {
                addToast(PDF_FILES_SECTION_TEXT.VIEW_ERROR, ToastType.Error);
            }
        },
        [client, addToast],
    );

    const handleRenameFile = useCallback(
        async (fileId: number, newName: string) => {
            setIsRenaming(true);
            try {
                const updatedFile = await PdfReportsApi.rename(client, fileId, newName);
                setUploadedFiles((prev) => {
                    const exists = prev.some((f) => f.id === fileId);
                    return exists ? prev.map((f) => (f.id === fileId ? updatedFile : f)) : [...prev, updatedFile];
                });
                addToast(PDF_FILES_SECTION_TEXT.RENAME_SUCCESS, ToastType.Success);
            } catch {
                addToast(PDF_FILES_SECTION_TEXT.RENAME_ERROR, ToastType.Error);
                setIsRenaming(false);
                return;
            }

            try {
                await refetchFiles();
            } catch {
            } finally {
                setIsRenaming(false);
            }
        },
        [client, addToast, refetchFiles],
    );

    if (isSectionLoading || isFilesLoading) {
        return (
            <div className={styles.loader}>
                <InlineLoader size={3} />
            </div>
        );
    }

    const mergedDedupedFiles = Array.from(
        new Map([...fetchedFiles, ...uploadedFiles].map((file) => [file.id, file])).values(),
    );

    return (
        <div className={styles.root}>
            <div className={styles['top-section']}>
                <PdfSectionContentBlock
                    content={sectionData ?? EMPTY_SECTION}
                    onSave={handleSaveSection}
                    translationLanguages={translationLanguages}
                />{' '}
            </div>
            <div className={styles['language-switcher-container']}>
                <LanguageSwitcherButtons currentLanguage={currentLanguage} onLanguageChange={setCurrentLanguage} />
            </div>
            <PdfDropzone onUploaded={handleUploaded} />
            <PdfFilesTable
                files={mergedDedupedFiles}
                onViewFile={handleViewFile}
                onDeleteFile={handleDeleteFile}
                onRenameFile={handleRenameFile}
                isDeleting={isDeleting}
                isRenaming={isRenaming}
            />
        </div>
    );
};
