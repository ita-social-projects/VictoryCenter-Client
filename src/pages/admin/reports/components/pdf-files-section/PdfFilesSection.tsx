import { useCallback, useEffect, useRef, useState } from 'react';
import { PdfSectionContentBlock } from './components/pdf-section-content-block/PdfSectionContentBlock';
import { PdfFilesTable } from './components/pdf-files-table/PdfFilesTable';
import styles from './PdfFilesSection.module.scss';
import { LanguageSwitcherButtons } from './components/language-switcher-buttons/LanguageSwitcherButtons';
import { PdfSectionApi } from '@/services/api/admin/reports/pdf-section/pdf-section-api';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { PdfReportDto, PdfSection } from '@/types/admin/pdf-section';
import { PdfReportsApi } from '@/services/api/admin/reports/pdf-reports/pdf-reports-api';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { InlineLoader } from '@/components/common/inline-loader/InlineLoader';
import { PdfDropzone } from './components/pdf-dropzone/PdfDropzone';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { ToastType } from '@/types/admin/toast';
import { PDF_FILES_SECTION_TEXT } from '@/const/admin/reports';
import { useLocalizationToolkit } from '@/hooks/admin/use-localization-toolkit/useLocalizationToolkit';
import { TranslatePdfSectionModal } from '../translate-pdf-section-modal/TranslatePdfSectionModal';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

const EMPTY_SECTION = { title: '', description: '', localizations: [] };

export const PdfFilesSection = () => {
    const client = useAdminClient();
    const { addToast } = useToast();
    const [currentLanguage, setCurrentLanguage] = useState<'uk' | 'en'>('uk');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isRenaming, setIsRenaming] = useState(false);
    const [isReordering, setIsReordering] = useState(false);
    const [isTranslateModalOpen, setIsTranslateModalOpen] = useState(false);

    const { translationLanguages, allLanguages } = useLocalizationToolkit({
        setErrorState: useCallback(
            (message: string) => {
                addToast(message, ToastType.Error);
            },
            [addToast],
        ),
    });

    const activeLanguageId = allLanguages.find((l) => l.code === currentLanguage)?.id;

    const fetchSection = useCallback(async () => {
        return PdfSectionApi.getPdfSection(client);
    }, [client]);

    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    const LIMIT = 20;

    const fetchedFilesRef = useRef<PdfReportDto[]>([]);
    const loadMoreAbortControllerRef = useRef<AbortController | null>(null);

    const {
        data: sectionData,
        isLoading: isSectionLoading,
        refetch: refetchSection,
        setData: setSectionData,
    } = useDataFetch({
        initialData: null,
        fetchHandler: fetchSection,
        autoFetchDependencies: [fetchSection],
    });

    const fetchFiles = useCallback(async () => {
        if (!activeLanguageId) return [];
        const currentLimit = Math.max(LIMIT, fetchedFilesRef.current?.length ?? 0);
        const data = await PdfReportsApi.getAll(client, {
            offset: 0,
            limit: currentLimit,
            languageId: activeLanguageId,
        });
        setTotalCount(data.totalItemsCount);
        return data.items;
    }, [client, activeLanguageId]);

    const {
        data: fetchedFiles,
        isLoading: isFilesLoading,
        refetch: refetchFiles,
        setData: setFetchedFiles,
    } = useDataFetch<PdfReportDto[]>({
        initialData: [],
        fetchHandler: fetchFiles,
        autoFetchDependencies: [fetchFiles],
    });

    useEffect(() => {
        fetchedFilesRef.current = fetchedFiles;
    }, [fetchedFiles]);

    useEffect(() => {
        return () => {
            loadMoreAbortControllerRef.current?.abort();
        };
    }, [activeLanguageId]);

    const handleLanguageChange = useCallback(
        (lang: 'uk' | 'en') => {
            loadMoreAbortControllerRef.current?.abort();
            setCurrentLanguage(lang);
            setTotalCount(0);
            fetchedFilesRef.current = [];
            setFetchedFiles([]);
        },
        [setFetchedFiles],
    );

    const handleLoadMore = useCallback(async () => {
        if (!activeLanguageId || isLoadingMore || isFilesLoading) return;
        const currentLength = fetchedFiles?.length ?? 0;
        if (currentLength >= totalCount) return;

        loadMoreAbortControllerRef.current?.abort();
        const abortController = new AbortController();
        loadMoreAbortControllerRef.current = abortController;

        setIsLoadingMore(true);
        try {
            const currentOffset = currentLength;
            const data = await PdfReportsApi.getAll(client, {
                offset: currentOffset,
                limit: LIMIT,
                languageId: activeLanguageId,
            });

            if (abortController.signal.aborted) return;

            setFetchedFiles((prev) => {
                const map = new Map((prev ?? []).map((f) => [f.id, f]));
                data.items.forEach((f) => map.set(f.id, f));
                return Array.from(map.values());
            });
            setTotalCount(data.totalItemsCount);
        } catch (error: any) {
            if (error?.name !== 'CanceledError' && error?.name !== 'AbortError') {
                addToast(PDF_FILES_SECTION_TEXT.MESSAGE.LOAD_ERROR, ToastType.Error);
            }
        } finally {
            if (!abortController.signal.aborted) {
                setIsLoadingMore(false);
            }
        }
    }, [
        client,
        activeLanguageId,
        fetchedFiles?.length,
        totalCount,
        isLoadingMore,
        isFilesLoading,
        setFetchedFiles,
        addToast,
    ]);

    const handleUploaded = useCallback(
        (newFile: PdfReportDto) => {
            loadMoreAbortControllerRef.current?.abort();
            setFetchedFiles((prev) => [newFile, ...(prev ?? [])]);
            setTotalCount((prev) => prev + 1);
            refetchFiles();
        },
        [refetchFiles, setFetchedFiles],
    );

    const handleSaveSection = useCallback(async () => {
        await refetchSection();
    }, [refetchSection]);

    const handleTranslatePdfSection = useCallback(
        (updated: PdfSection) => {
            setSectionData(updated);
            addToast(COMMON_TEXT_ADMIN.MESSAGE.TRANSLATION_SAVED_SUCCESS, ToastType.Success);
        },
        [addToast, setSectionData],
    );

    const handleDeleteFile = useCallback(
        async (fileId: number) => {
            loadMoreAbortControllerRef.current?.abort();
            setIsDeleting(true);
            try {
                await PdfReportsApi.delete(client, fileId);
                setFetchedFiles((prev) => (prev ?? []).filter((f) => f.id !== fileId));
                setTotalCount((prev) => (prev > 0 ? prev - 1 : 0));
                addToast(PDF_FILES_SECTION_TEXT.MESSAGE.DELETE_SUCCESS, ToastType.Success);
            } catch {
                addToast(PDF_FILES_SECTION_TEXT.MESSAGE.DELETE_ERROR, ToastType.Error);
            } finally {
                setIsDeleting(false);
            }

            try {
                await refetchFiles();
            } catch {}
        },
        [client, addToast, refetchFiles, setFetchedFiles],
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
                addToast(PDF_FILES_SECTION_TEXT.MESSAGE.VIEW_ERROR, ToastType.Error);
            }
        },
        [client, addToast],
    );

    const handleRenameFile = useCallback(
        async (fileId: number, newName: string) => {
            loadMoreAbortControllerRef.current?.abort();
            setIsRenaming(true);
            try {
                const updatedFile = await PdfReportsApi.rename(client, fileId, newName);
                setFetchedFiles((prev) => (prev ?? []).map((f) => (f.id === fileId ? updatedFile : f)));
                addToast(PDF_FILES_SECTION_TEXT.MESSAGE.RENAME_SUCCESS, ToastType.Success);
            } catch {
                addToast(PDF_FILES_SECTION_TEXT.MESSAGE.RENAME_ERROR, ToastType.Error);
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
        [client, addToast, refetchFiles, setFetchedFiles],
    );

    const handleReorderFiles = useCallback(
        async (reorderedFiles: PdfReportDto[]) => {
            if (!activeLanguageId || isReordering) return;

            if (!reorderedFiles || reorderedFiles.length === 0) return;

            const currentFiles = fetchedFilesRef.current;
            const currentDedupedCount = new Set(currentFiles.map((f) => f.id)).size;
            if (reorderedFiles.length !== currentDedupedCount) {
                // eslint-disable-next-line no-console
                console.error('File count mismatch during reorder');
                return;
            }

            const previousState = fetchedFilesRef.current;
            setIsReordering(true);

            try {
                setFetchedFiles(reorderedFiles);
                const orderedIds = reorderedFiles.map((f) => f.id);
                await PdfReportsApi.reorder(client, activeLanguageId, orderedIds);
                await refetchFiles();
                addToast(PDF_FILES_SECTION_TEXT.MESSAGE.REORDER_SUCCESS, ToastType.Success);
            } catch {
                setFetchedFiles(previousState ?? []);
                addToast(PDF_FILES_SECTION_TEXT.MESSAGE.REORDER_ERROR, ToastType.Error);
            } finally {
                setIsReordering(false);
            }
        },
        [client, activeLanguageId, isReordering, setFetchedFiles, refetchFiles, addToast],
    );

    const isInitialFilesLoading = isFilesLoading && (!fetchedFiles || fetchedFiles.length === 0) && totalCount === 0;

    if (isSectionLoading || isInitialFilesLoading || !activeLanguageId) {
        return (
            <div className={styles.loader}>
                <InlineLoader size={3} />
            </div>
        );
    }

    return (
        <div className={styles.root}>
            <div className={styles['top-section']}>
                <PdfSectionContentBlock
                    content={sectionData ?? EMPTY_SECTION}
                    onAfterSave={handleSaveSection}
                    translationLanguages={translationLanguages}
                    onTranslateClick={() => setIsTranslateModalOpen(true)}
                />
            </div>
            <div className={styles['language-switcher-container']}>
                <LanguageSwitcherButtons currentLanguage={currentLanguage} onLanguageChange={handleLanguageChange} />
            </div>
            <PdfDropzone onUploaded={handleUploaded} languageId={activeLanguageId} />
            <PdfFilesTable
                files={fetchedFiles ?? []}
                onViewFile={handleViewFile}
                onDeleteFile={handleDeleteFile}
                onRenameFile={handleRenameFile}
                onReorderFiles={handleReorderFiles}
                isDeleting={isDeleting}
                isRenaming={isRenaming}
                isReordering={isReordering}
                isLoadingMore={isLoadingMore}
                onLoadMore={handleLoadMore}
            />
            <TranslatePdfSectionModal
                isOpen={isTranslateModalOpen}
                onClose={() => setIsTranslateModalOpen(false)}
                pdfSection={sectionData}
                onTranslatePdfSection={handleTranslatePdfSection}
                translatedLanguages={translationLanguages}
            />
        </div>
    );
};
