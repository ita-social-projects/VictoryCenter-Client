import styles from './HistoryPageContent.module.scss';
import { Button } from '@/components/admin/button/Button';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { InlineLoader } from '@/components/common/inline-loader/InlineLoader';
import NotFoundIcon from '@/assets/icons/not-found.svg';
import { HISTORY_TEXT } from '@/const/admin/history';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { SECTIONS_TEXT } from '@/const/admin/sections';
import { ReactComponent as PlusIcon } from '@/assets/icons/plus.svg';
import { HistoryPageToolbar } from '../history-page-toolbar/HistoryPageToolbar';
import { useCallback, useRef, useState } from 'react';
import { HistoryApi } from '@/services/api/admin/history/history-api';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { CreateUpdateHistorySectionDto, HistorySectionDto } from '@/types/common/history-sections';
import { useSectionCancelConfirmation } from '@/hooks/admin/use-section-cancel-confirmation/useSectionCancelConfirmation';
import { SectionCancelActionType } from '@/types/admin/programs';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { HistoryForm, HistoryFormRef } from '../history-form/HistoryForm';
import {
    getInitialHistorySectionContents,
    HISTORY_SUPPORTED_TEMPLATES,
} from '@/utils/functions/render-history-section';
import { SectionTemplate } from '@/types/common/sections';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { ToastType } from '@/types/admin/toast';
import { AddSectionModal } from '@/pages/admin/programs/components/programs-page-modals/add-section-modal/AddSectionModal';

export const HistoryPageContent = () => {
    const client = useAdminClient();
    const { addToast } = useToast();
    const historyFormRef = useRef<HistoryFormRef>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [sectionToReplace, setSectionToReplace] = useState<number | null>(null);
    const [canPublish, setCanPublish] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [localSectionsCount, setLocalSectionsCount] = useState<number | null>(null);
    const {
        isSectionRemoveModalOpen,
        isSectionRevertModalOpen,
        pendingCancelActionType,
        handleRequestCancelSection,
        handleCloseSectionRemoveModal,
        handleCloseSectionRevertModal,
        handleConfirmRemoveSection,
        handleConfirmRevertSection,
    } = useSectionCancelConfirmation();

    const getHistorySections = useCallback(async () => {
        const sections = await HistoryApi.fetchSections(client);
        return sections;
    }, [client]);

    const {
        data: sections,
        error: sectionsError,
        isLoading: isSectionsLoading,
        refetch: refetchSections,
    } = useDataFetch<HistorySectionDto[] | null>({
        initialData: null,
        fetchHandler: getHistorySections,
        autoFetchDependencies: [],
        autoFetchDisabled: false,
    });

    const TEMPLATES = HISTORY_SUPPORTED_TEMPLATES;

    const normalizedSections = sections ?? [];
    const hasSections = localSectionsCount !== null ? localSectionsCount > 0 : normalizedSections.length > 0;
    const hasSectionsError = Boolean(sectionsError);

    const handleAddSection = () => {
        setSectionToReplace(null);
        setIsAddModalOpen(true);
    };

    const handleReplaceSection = useCallback((sectionIndex: number) => {
        setSectionToReplace(sectionIndex);
        setIsAddModalOpen(true);
    }, []);

    const handleTemplateSelect = useCallback(
        (templateId: SectionTemplate) => {
            const currentSections = normalizedSections;
            if (sectionToReplace !== null) {
                const sectionBeingReplaced = currentSections[sectionToReplace];
                const newSection: HistorySectionDto = {
                    template: templateId,
                    order: sectionBeingReplaced?.order ?? sectionToReplace,
                    contents: getInitialHistorySectionContents(templateId),
                };
                historyFormRef.current?.replaceSection(sectionToReplace, newSection);
            } else {
                const nextOrder =
                    currentSections.length === 0
                        ? 0
                        : Math.max(...currentSections.map((s: HistorySectionDto) => s.order)) + 1;
                const newSection: HistorySectionDto = {
                    template: templateId,
                    order: nextOrder,
                    contents: getInitialHistorySectionContents(templateId),
                };
                historyFormRef.current?.addSection(newSection);
            }
            setSectionToReplace(null);
        },
        [sectionToReplace, normalizedSections],
    );

    const handleRetrySections = useCallback(() => {
        void refetchSections();
    }, [refetchSections]);

    const handleSectionSaved = useCallback(() => {
        setCanPublish(true);
    }, []);

    const handleSectionDeleted = useCallback(
        async (remainingSections: HistorySectionDto[]) => {
            try {
                const payload: CreateUpdateHistorySectionDto[] = remainingSections.map((s: HistorySectionDto) => ({
                    template: s.template,
                    order: s.order,
                    contents: s.contents.map((c) => ({ ...c })),
                }));
                await HistoryApi.syncSections(client, payload);
                addToast(HISTORY_TEXT.MESSAGE.PUBLISH_SUCCESS, ToastType.Success);
            } catch {
                addToast(HISTORY_TEXT.MESSAGE.PUBLISH_ERROR, ToastType.Error);
            }
        },
        [client, addToast],
    );

    const handlePublish = useCallback(async () => {
        setIsPublishing(true);
        try {
            const currentSections = historyFormRef.current?.getSections() ?? [];

            const payload: CreateUpdateHistorySectionDto[] = currentSections.map((s: HistorySectionDto) => ({
                template: s.template,
                order: s.order,
                contents: s.contents.map((c) => ({ ...c })),
            }));

            await HistoryApi.syncSections(client, payload);
            addToast(HISTORY_TEXT.MESSAGE.PUBLISH_SUCCESS, ToastType.Success);
            setCanPublish(false);
            void refetchSections();
        } catch {
            addToast(HISTORY_TEXT.MESSAGE.PUBLISH_ERROR, ToastType.Error);
        } finally {
            setIsPublishing(false);
        }
    }, [client, refetchSections, addToast]);

    return (
        <div className={styles['history-page-wrapper']} data-testid="history-page-content">
            <HistoryPageToolbar onAddSection={handleAddSection} />
            <div className={styles['sections-container']}>
                {isSectionsLoading && (
                    <div className={styles['sections-loader-state']} data-testid="history-sections-loader">
                        <InlineLoader size={3} />
                    </div>
                )}

                {!isSectionsLoading && hasSectionsError && (
                    <div className={styles['sections-error-state']} data-testid="history-sections-error">
                        <p className={styles['sections-error-text']}>{HISTORY_TEXT.MESSAGE.FAIL_TO_FETCH_SECTIONS}</p>
                        <button
                            type="button"
                            className={styles['retry-link']}
                            onClick={handleRetrySections}
                            data-testid="history-sections-retry-button"
                        >
                            {COMMON_TEXT_ADMIN.BUTTON.TRY_AGAIN}
                        </button>
                    </div>
                )}

                {!isSectionsLoading && !hasSectionsError && !hasSections && (
                    <div className={styles['empty-sections-state']}>
                        <img src={NotFoundIcon} alt="No sections" className={styles['empty-sections-image']} />
                        <p className={styles['empty-sections-text']}>{HISTORY_TEXT.MESSAGE.NO_SECTIONS_YET}</p>
                        <Button
                            className={styles['btn-add']}
                            onClick={handleAddSection}
                            buttonStyle="secondary"
                            data-testid="add-section-button-empty"
                        >
                            {HISTORY_TEXT.BUTTON.ADD_SECTION}
                            <PlusIcon className={styles['plus-icon']} />
                        </Button>
                    </div>
                )}

                {!isSectionsLoading && !hasSectionsError && (
                    <HistoryForm
                        ref={historyFormRef}
                        sections={normalizedSections}
                        onReplaceSection={handleReplaceSection}
                        onSectionsChange={(s) => setLocalSectionsCount(s.length)}
                        onSectionSaved={handleSectionSaved}
                        onSectionDeleted={handleSectionDeleted}
                        onRequestCancelSection={handleRequestCancelSection}
                    />
                )}
                <Button onClick={handlePublish} buttonStyle="primary" disabled={!canPublish || isPublishing}>
                    {HISTORY_TEXT.BUTTON.PUBLISH}
                </Button>
            </div>
            <AddSectionModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSelectTemplate={handleTemplateSelect}
                templates={TEMPLATES}
            />
            <ConfirmationModal
                isOpen={isSectionRemoveModalOpen}
                onClose={handleCloseSectionRemoveModal}
                title={SECTIONS_TEXT.SECTION.MODAL.DELETE_SECTION_TITLE}
                onConfirm={handleConfirmRemoveSection}
                onCancel={handleCloseSectionRemoveModal}
            />
            <ConfirmationModal
                isOpen={isSectionRevertModalOpen}
                onClose={handleCloseSectionRevertModal}
                title={
                    pendingCancelActionType === SectionCancelActionType.RevertAfterReplace
                        ? SECTIONS_TEXT.SECTION.MODAL.REPLACE_TEMPLATE_TITLE
                        : pendingCancelActionType === SectionCancelActionType.DiscardNewSection
                          ? SECTIONS_TEXT.SECTION.MODAL.UNSAVED_CHANGES_TITLE
                          : COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE
                }
                onConfirm={handleConfirmRevertSection}
                onCancel={handleCloseSectionRevertModal}
            />
        </div>
    );
};
