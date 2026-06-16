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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { ToastContainer } from '@/components/admin/toast/toast-container/ToastContainer';
import { useLocalizationToolkit } from '@/hooks/admin/use-localization-toolkit/useLocalizationToolkit';
import { TranslateHistoryModal } from '../translate-history-modal/TranslateHistoryModal';
import { mapHistorySectionDtoToModel } from '@/utils/functions/mappers/admin/history/history-mappers';
import { ContentType } from '@/types/common/section-contents';
import {
    EntityWithTranslationStatuses,
    TranslationStatus,
    TranslationStatusFilter,
    TranslationStatusInfo,
} from '@/types/common/language';

type HistoryErrorType = 'languages';

interface HistoryErrorState {
    message: string | null;
    type: HistoryErrorType | null;
}

export const HistoryPageContent = () => {
    const client = useAdminClient();
    const { addToast } = useToast();
    const [isConfirmationModalOpen, setConfirmationModalOpen] = useState<boolean>(false);
    const historyFormRef = useRef<HistoryFormRef>(null);
    const pendingSectionRef = useRef<HistorySectionDto | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [sectionToReplace, setSectionToReplace] = useState<number | null>(null);
    const [canPublish, setCanPublish] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [localSectionsCount, setLocalSectionsCount] = useState<number | null>(null);
    const [hasActiveSectionForm, setHasActiveSectionForm] = useState(false);
    const [isTranslateModalOpen, setIsTranslateModalOpen] = useState(false);
    const [, setLocalizationError] = useState<HistoryErrorState>({ message: null, type: null });

    const setErrorState = useCallback((message: string, type: HistoryErrorType) => {
        setLocalizationError({ message, type });
    }, []);

    const {
        allLanguages,
        translationLanguages,
        selectedLanguage,
        onLanguageChange,
        translationStatusFilter,
        onTranslationStatusFilterChange,
    } = useLocalizationToolkit({ setErrorState });
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

    const normalizedSections = useMemo(() => sections ?? [], [sections]);
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
                if (historyFormRef.current) {
                    historyFormRef.current.addSection(newSection);
                } else {
                    pendingSectionRef.current = newSection;
                    setLocalSectionsCount(1);
                }
            }
            setSectionToReplace(null);
        },
        [sectionToReplace, normalizedSections],
    );

    useEffect(() => {
        if (pendingSectionRef.current !== null && historyFormRef.current !== null) {
            const section = pendingSectionRef.current;
            pendingSectionRef.current = null;
            historyFormRef.current.addSection(section);
        }
    });

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
                    contents: s.contents.map((c) => ({
                        contentType: c.contentType,
                        order: c.order,
                        title: c.title,
                        description: c.description,
                        image: c.image,
                        imageId: c.imageId,
                    })),
                }));
                await HistoryApi.syncSections(client, payload);
                void refetchSections();
            } catch {
                addToast(HISTORY_TEXT.MESSAGE.PUBLISH_ERROR, ToastType.Error);
            }
        },
        [client, addToast, refetchSections],
    );

    const handlePublish = useCallback(async () => {
        setConfirmationModalOpen(false);
        setIsPublishing(true);
        try {
            const currentSections = historyFormRef.current?.getSections() ?? [];

            const payload: CreateUpdateHistorySectionDto[] = currentSections.map((s: HistorySectionDto) => ({
                template: s.template,
                order: s.order,
                contents: s.contents.map((c) => ({
                    contentType: c.contentType,
                    order: c.order,
                    title: c.title,
                    description: c.description,
                    image: c.image,
                    imageId: c.imageId,
                })),
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

    const localizedEntity = useMemo((): EntityWithTranslationStatuses | undefined => {
        const translationStatuses: TranslationStatusInfo[] = [];

        for (const lang of translationLanguages) {
            let hasMissing = false;
            let hasOutdated = false;
            let hasLocalizableContent = false;

            for (const section of normalizedSections) {
                const mappedSection = mapHistorySectionDtoToModel(section);
                for (const content of mappedSection.contents) {
                    if (content.contentType !== ContentType.Image) {
                        hasLocalizableContent = true;
                        const loc = content.localizations?.find((l) => l.language.id === lang.id);
                        if (!loc) {
                            hasMissing = true;
                        } else if (loc.translationStatus === TranslationStatus.Outdated) {
                            hasOutdated = true;
                        }
                    }
                }
            }

            if (hasLocalizableContent && !hasMissing) {
                translationStatuses.push({
                    languageId: lang.id,
                    translationStatus: hasOutdated ? TranslationStatus.Outdated : TranslationStatus.Relevant,
                });
            }
        }

        return { translationStatuses };
    }, [normalizedSections, translationLanguages]);

    const filteredSections = useMemo(() => {
        if (!translationStatusFilter || translationLanguages.length === 0) return normalizedSections;

        return normalizedSections.filter((section) => {
            const mappedSection = mapHistorySectionDtoToModel(section);
            const localizableContents = mappedSection.contents.filter((c) => c.contentType !== ContentType.Image);

            if (localizableContents.length === 0) return false;

            return localizableContents.some((content) => {
                for (const lang of translationLanguages) {
                    const loc = content.localizations?.find((l) => l.language.id === lang.id);

                    if (translationStatusFilter === TranslationStatusFilter.Missing && !loc) {
                        return true;
                    }
                    if (
                        translationStatusFilter === TranslationStatusFilter.Outdated &&
                        loc?.translationStatus === TranslationStatus.Outdated
                    ) {
                        return true;
                    }
                }
                return false;
            });
        });
    }, [normalizedSections, translationStatusFilter, translationLanguages]);

    return (
        <div className={styles['history-page-wrapper']} data-testid="history-page-content">
            <HistoryPageToolbar
                onAddSection={handleAddSection}
                onTranslate={() => setIsTranslateModalOpen(true)}
                translationLanguages={translationLanguages}
                languages={allLanguages}
                localizedEntity={localizedEntity}
                onLanguageChange={onLanguageChange}
                onTranslationStatusFilterChange={onTranslationStatusFilterChange}
            />
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

                {!isSectionsLoading && !hasSectionsError && hasSections && (
                    <HistoryForm
                        ref={historyFormRef}
                        sections={filteredSections}
                        onReplaceSection={handleReplaceSection}
                        onSectionsChange={(s) => {
                            setLocalSectionsCount(s.length);
                            setCanPublish(true);
                        }}
                        onHasEditingSectionChange={setHasActiveSectionForm}
                        onSectionSaved={handleSectionSaved}
                        onSectionDeleted={handleSectionDeleted}
                        onRequestCancelSection={handleRequestCancelSection}
                        language={selectedLanguage}
                    />
                )}
                <div className={styles['functional-button-container']}>
                    {hasSections && !isAddModalOpen && !hasActiveSectionForm && (
                        <Button
                            className={styles['btn-add']}
                            onClick={handleAddSection}
                            buttonStyle="secondary"
                            data-testid="add-section-button-empty"
                        >
                            {HISTORY_TEXT.BUTTON.ADD_SECTION}
                            <PlusIcon className={styles['plus-icon']} />
                        </Button>
                    )}
                    {hasSections && (
                        <Button
                            className={styles['btn-publish']}
                            onClick={() => setConfirmationModalOpen(true)}
                            buttonStyle="primary"
                            disabled={!canPublish || isPublishing}
                        >
                            {HISTORY_TEXT.BUTTON.PUBLISH}
                        </Button>
                    )}
                </div>
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
            <ConfirmationModal
                isOpen={isConfirmationModalOpen}
                onClose={() => setConfirmationModalOpen(false)}
                title={COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES}
                onConfirm={handlePublish}
                onCancel={() => setConfirmationModalOpen(false)}
            />
            {isTranslateModalOpen && (
                <TranslateHistoryModal
                    isOpen={isTranslateModalOpen}
                    onClose={() => setIsTranslateModalOpen(false)}
                    sections={normalizedSections}
                    languages={translationLanguages}
                    onSaved={(updatedSections) => {
                        if (historyFormRef.current) {
                            historyFormRef.current.getSections().forEach((_, idx) => {
                                historyFormRef.current?.replaceSection(idx, updatedSections[idx]);
                            });
                        }
                        setCanPublish(true);
                        addToast(HISTORY_TEXT.MESSAGE.TRANSLATE_SUCCESS, ToastType.Success);
                    }}
                />
            )}
            <ToastContainer />
        </div>
    );
};
