import React, { forwardRef, useCallback, useImperativeHandle, useState, useEffect, useMemo, useRef } from 'react';
import {
    PartnerSectionForm,
    PartnerSectionErrors,
    PartnerSectionFormValues,
} from '../partner-section/PartnerSectionForm';
import { RequestOptions } from '@/types/common/api';
import { ToastType } from '@/types/admin/toast';
import { PARTNERS_TEXT } from '@/const/admin/partners';
import axios from 'axios';
import { PartnerFormValues } from '../partner-form/PartnerForm';
import { PartnersApi } from '@/services/api/admin/partners/partners-api';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { InlineLoader } from '@/components/common/inline-loader/InlineLoader';
import {
    Partner,
    PartnerSection,
    PartnerSectionLocalizationDto,
    PartnersSectionCreateRequest,
    PartnersSectionUpdateRequest,
} from '@/types/admin/partners';
import { LocalizationLanguage } from '@/types/common/language';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { PartnerSectionLocalizationApi } from '@/services/api/admin/partners/partner-section-localizations-api';
import { TranslatePartnerSectionModal } from '../translate-partner-section-modal/TranslatePartnerSectionModal';
import styles from './PartnerSectionsEditor.module.scss';

const isPartnerEmpty = (partner: PartnerFormValues): boolean => {
    return !partner.description && !partner.image;
};

const isSectionEmpty = (section: PartnerSectionFormValues): boolean => {
    if (!section) return false;
    const titleEmpty = !section.title.trim();
    const descriptionEmpty = !section.description.trim();
    if (section.partners.length === 0) {
        return titleEmpty && descriptionEmpty;
    }
    const allPartnersEmpty = section.partners.every(isPartnerEmpty);
    return titleEmpty && descriptionEmpty && allPartnersEmpty;
};

const isImageEqual = (img1: any, img2: any) => {
    if (img1 === img2) return true;
    if (!img1 || !img2) return false;
    if ('url' in img1 && 'url' in img2) return img1.url === img2.url;
    if ('base64' in img1 && 'base64' in img2) return img1.base64 === img2.base64;
    return false;
};

const isSectionDirty = (section: PartnerSectionFormValues, fetchedSections: PartnerSection[]): boolean => {
    if (section.sectionId === null) return true;

    const originalSection = fetchedSections.find((s) => s.id === section.sectionId);
    if (!originalSection) return true;

    if (section.title !== originalSection.title) return true;
    if (section.description !== originalSection.description) return true;
    if (section.deletedPartnerIds && section.deletedPartnerIds.length > 0) return true;
    if (section.partners.length !== originalSection.partners.length) return true;

    const originalPartnersMap = new Map(originalSection.partners.map((p) => [p.id, p]));

    for (const partner of section.partners) {
        if (partner.partnerId === null) return true;

        const originalPartner = originalPartnersMap.get(partner.partnerId);
        if (!originalPartner) return true;

        if (partner.description !== originalPartner.description) return true;
        if (partner.imageId !== originalPartner.imageId) return true;
        if (!isImageEqual(partner.image, originalPartner.image)) return true;
    }

    return false;
};

export interface PartnerSectionsEditorRef {
    addSection: () => void;
}

enum DeletePhase {
    IDLE = 'idle',
    CONFIRM_SECTION = 'confirm_section',
    CONFIRM_PARTNERS = 'confirm_partners',
}

export interface PartnerSectionsEditorProps {
    language: LocalizationLanguage;
    translationLanguages: LocalizationLanguage[];
}

export const PartnerSectionsEditor = forwardRef<PartnerSectionsEditorRef, PartnerSectionsEditorProps>(
    ({ language, translationLanguages }, ref) => {
        const client = useAdminClient();
        const { addToast } = useToast();
        const [errors, setErrors] = useState<PartnerSectionErrors[]>([]);
        const [isPublishing, setIsPublishing] = useState<boolean>(false);
        const [deletePhase, setDeletePhase] = useState<DeletePhase>(DeletePhase.IDLE);
        const [sectionToDeleteId, setSectionToDeleteId] = useState<string | null>(null);
        const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
        const [sectionToPublishId, setSectionToPublishId] = useState<string | null>(null);
        const [sectionToPublishData, setSectionToPublishData] = useState<PartnerSectionFormValues | null>(null);
        const [localSections, setLocalSections] = useState<PartnerSectionFormValues[]>([]);
        const [translatingSectionId, setTranslatingSectionId] = useState<number | null>(null);
        const [sectionTranslations, setSectionTranslations] = useState<
            Record<number, PartnerSectionLocalizationDto | null>
        >({});
        const [isLoadingTranslations, setIsLoadingTranslations] = useState(false);
        const scrollAnchorRef = useRef<HTMLDivElement>(null);

        const isBaseLanguage = language.code === DEFAULT_LOCALE;

        const fetchSectionsHandler = useCallback(
            async (options: RequestOptions): Promise<PartnerSection[]> => {
                return await PartnersApi.getSections(client, options);
            },
            [client],
        );

        const {
            data: fetchedSections,
            isLoading: isSectionsLoading,
            error: sectionsFetchError,
            refetch: refetchSections,
            setData: setFetchedSections,
        } = useDataFetch<PartnerSection[]>({
            initialData: [],
            fetchHandler: fetchSectionsHandler,
            autoFetchDisabled: false,
        });

        useEffect(() => {
            setLocalSections(
                fetchedSections.map((section: PartnerSection) => ({
                    localId: crypto.randomUUID(),
                    sectionId: section.id,
                    title: section.title,
                    description: section.description,
                    deletedPartnerIds: [],
                    partners: section.partners.map((p) => ({
                        localId: crypto.randomUUID(),
                        partnerId: p.id,
                        description: p.description,
                        image: p.image,
                        imageId: p.imageId,
                    })),
                })),
            );
            setErrors(
                fetchedSections.map((section: PartnerSection) => ({
                    partners: section.partners.map(() => ({})),
                })),
            );
        }, [fetchedSections]);

        useEffect(() => {
            if (sectionsFetchError) {
                if (
                    axios.isCancel?.(sectionsFetchError) ||
                    sectionsFetchError.name === 'CanceledError' ||
                    sectionsFetchError.name === 'AbortError'
                ) {
                    return;
                }
                addToast(PARTNERS_TEXT.MESSAGE.FAIL_TO_LOAD_PARTNERS, ToastType.Error);
            }
        }, [sectionsFetchError, addToast]);

        useEffect(() => {
            if (isBaseLanguage) {
                setSectionTranslations({});
                setIsLoadingTranslations(false);
                return;
            }

            let cancelled = false;

            setSectionTranslations({});

            const fetchTranslations = async () => {
                setIsLoadingTranslations(true);
                try {
                    const sectionIds = fetchedSections.map((section) => section.id);
                    const results = await Promise.allSettled(
                        sectionIds.map((sectionId) =>
                            PartnerSectionLocalizationApi.get(client, sectionId, language.id),
                        ),
                    );

                    if (cancelled) return;

                    let hasFailure = false;

                    setSectionTranslations(
                        sectionIds.reduce<Record<number, PartnerSectionLocalizationDto | null>>(
                            (acc, sectionId, index) => {
                                const result = results[index];
                                if (result.status === 'fulfilled') {
                                    acc[sectionId] = result.value;
                                } else {
                                    const error = result.reason;
                                    const isCancelError =
                                        axios.isCancel?.(error) ||
                                        error?.name === 'CanceledError' ||
                                        error?.name === 'AbortError';
                                    if (!isCancelError) {
                                        hasFailure = true;
                                    }
                                    acc[sectionId] = null;
                                }
                                return acc;
                            },
                            {},
                        ),
                    );

                    if (hasFailure) {
                        addToast(PARTNERS_TEXT.MESSAGE.FAIL_TO_LOAD_PARTNERS, ToastType.Error);
                    }
                } catch (error: any) {
                    if (
                        cancelled ||
                        axios.isCancel?.(error) ||
                        error.name === 'CanceledError' ||
                        error.name === 'AbortError'
                    ) {
                        return;
                    }
                    addToast(PARTNERS_TEXT.MESSAGE.FAIL_TO_LOAD_PARTNERS, ToastType.Error);
                } finally {
                    if (!cancelled) {
                        setIsLoadingTranslations(false);
                    }
                }
            };

            fetchTranslations();

            return () => {
                cancelled = true;
            };
        }, [isBaseLanguage, language, fetchedSections, client, addToast]);

        const handleChange = useCallback(
            (updatedSection: PartnerSectionFormValues, sectionErrors: PartnerSectionErrors) => {
                setLocalSections((currentSections) =>
                    currentSections.map((s) => (s.localId === updatedSection.localId ? updatedSection : s)),
                );

                setErrors((currentErrors) => {
                    const index = localSections.findIndex((s) => s.localId === updatedSection.localId);
                    if (index === -1) return currentErrors;

                    const newErrors = [...currentErrors];
                    newErrors[index] = sectionErrors;
                    return newErrors;
                });
            },
            [localSections, setLocalSections],
        );

        const handlePublishRequest = useCallback((localId: string, sectionData: PartnerSectionFormValues) => {
            setSectionToPublishId(localId);
            setSectionToPublishData(sectionData);
            setIsPublishModalOpen(true);
        }, []);

        const handleClosePublishModal = useCallback(() => {
            setIsPublishModalOpen(false);
            setSectionToPublishId(null);
            setSectionToPublishData(null);
        }, []);

        const handleConfirmPublish = useCallback(async () => {
            if (!sectionToPublishId || !sectionToPublishData) return;

            setIsPublishing(true);
            setIsPublishModalOpen(false);
            try {
                const sectionToPublish = sectionToPublishData;

                let savedSection: PartnerSection;

                if (sectionToPublish.sectionId === null) {
                    const createRequest: PartnersSectionCreateRequest = {
                        title: sectionToPublish.title,
                        description: sectionToPublish.description,
                        partners: sectionToPublish.partners.map((p) => ({
                            description: p.description,
                            image: p.image,
                            imageId: p.imageId,
                        })),
                    };

                    savedSection = await PartnersApi.postSection(client, createRequest);
                    addToast(PARTNERS_TEXT.MESSAGE.SECTION_CREATED, ToastType.Success);
                } else {
                    const updateRequest: PartnersSectionUpdateRequest = {
                        title: sectionToPublish.title,
                        description: sectionToPublish.description,
                        partnersToUpdate: sectionToPublish.partners.map((p) => ({
                            id: p.partnerId,
                            description: p.description,
                            image: p.image,
                            imageId: p.imageId,
                        })),
                        partnerIdsToDelete: sectionToPublish.deletedPartnerIds || [],
                    };

                    savedSection = await PartnersApi.updateSection(client, sectionToPublish.sectionId, updateRequest);
                    addToast(PARTNERS_TEXT.MESSAGE.SECTION_PUBLISHED, ToastType.Success);
                }

                const mapPartnerToFormValue = (p: Partner) => ({
                    localId: crypto.randomUUID(),
                    partnerId: p.id,
                    description: p.description,
                    image: p.image,
                    imageId: p.imageId,
                });

                const updateSectionInList = (s: PartnerSectionFormValues) => {
                    if (s.localId === sectionToPublishId) {
                        return {
                            ...s,
                            sectionId: savedSection.id,
                            title: savedSection.title,
                            description: savedSection.description,
                            deletedPartnerIds: [],
                            partners: savedSection.partners.map(mapPartnerToFormValue),
                        };
                    }
                    return s;
                };

                setLocalSections((currentSections) => currentSections.map(updateSectionInList));
                setFetchedSections((current) => {
                    const currentArray = current || [];
                    const existingIndex = currentArray.findIndex((s) => s.id === savedSection.id);
                    if (existingIndex >= 0) {
                        const newArray = [...currentArray];
                        newArray[existingIndex] = savedSection;
                        return newArray;
                    }
                    return [...currentArray, savedSection];
                });
            } catch (error: any) {
                if (axios.isCancel?.(error) || error.name === 'CanceledError' || error.name === 'AbortError') {
                    return;
                }
                addToast(PARTNERS_TEXT.MESSAGE.FAIL_TO_PUBLISH_SECTION, ToastType.Error);
            } finally {
                setIsPublishing(false);
                setSectionToPublishId(null);
                setSectionToPublishData(null);
            }
        }, [sectionToPublishData, addToast, client, setLocalSections, sectionToPublishId, setFetchedSections]);

        const handleOpenTranslate = useCallback((sectionId: number) => {
            setTranslatingSectionId(sectionId);
        }, []);

        const handleCloseTranslate = useCallback(() => {
            setTranslatingSectionId(null);
        }, []);

        const handleTranslated = useCallback(() => {
            refetchSections();
        }, [refetchSections]);

        const sectionToTranslate = useMemo(
            () => fetchedSections.find((s) => s.id === translatingSectionId) ?? null,
            [fetchedSections, translatingSectionId],
        );

        const handleDeleteRequest = useCallback((localId: string) => {
            setSectionToDeleteId(localId);
            setDeletePhase(DeletePhase.CONFIRM_SECTION);
        }, []);

        const handleCloseModal = useCallback(() => {
            setDeletePhase(DeletePhase.IDLE);
            setSectionToDeleteId(null);
        }, []);

        const handleFirstConfirm = useCallback(() => {
            setDeletePhase(DeletePhase.CONFIRM_PARTNERS);
        }, []);

        const handleFinalConfirmDelete = useCallback(async () => {
            if (!sectionToDeleteId) return;

            setIsPublishing(true);
            setDeletePhase(DeletePhase.IDLE);

            try {
                const sectionToDelete = localSections.find((s) => s.localId === sectionToDeleteId);

                if (sectionToDelete && sectionToDelete.sectionId) {
                    await PartnersApi.deleteSection(client, sectionToDelete.sectionId);
                }

                const indexToDelete = localSections.findIndex((s) => s.localId === sectionToDeleteId);
                setLocalSections((current) => current.filter((s) => s.localId !== sectionToDeleteId));
                setErrors((current) => current.filter((_, i) => i !== indexToDelete));

                if (sectionToDelete && sectionToDelete.sectionId) {
                    setFetchedSections((current) => (current || []).filter((s) => s.id !== sectionToDelete.sectionId));
                }

                addToast(PARTNERS_TEXT.MESSAGE.SECTION_DELETED, ToastType.Success);
            } catch (error: any) {
                if (axios.isCancel?.(error) || error.name === 'CanceledError' || error.name === 'AbortError') {
                    return;
                }
                addToast(PARTNERS_TEXT.MESSAGE.FAIL_TO_DELETE_SECTION, ToastType.Error);
            } finally {
                setIsPublishing(false);
                setSectionToDeleteId(null);
            }
        }, [localSections, client, setLocalSections, sectionToDeleteId, addToast, setFetchedSections]);

        const addSection = useCallback(() => {
            if (isPublishing || isSectionsLoading || !isBaseLanguage) {
                return;
            }
            if (localSections.length > 0) {
                const lastSection = localSections[localSections.length - 1];
                if (isSectionEmpty(lastSection)) {
                    return;
                }
            }

            const newSection: PartnerSectionFormValues = {
                localId: crypto.randomUUID(),
                sectionId: null,
                title: '',
                description: '',
                partners: [
                    {
                        localId: crypto.randomUUID(),
                        partnerId: null,
                        description: '',
                        image: null,
                        imageId: null,
                    },
                ],
                deletedPartnerIds: [],
            };

            setLocalSections((current) => [...current, newSection]);
            setErrors((current) => [...current, { partners: [] }]);
            setTimeout(() => {
                scrollAnchorRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
            }, 0);
        }, [isPublishing, isSectionsLoading, isBaseLanguage, localSections, setLocalSections, setErrors]);

        useImperativeHandle(
            ref,
            () => ({
                addSection: addSection,
            }),
            [addSection],
        );

        const sectionDirtyStates = React.useMemo(
            () => localSections.map((section) => isSectionDirty(section, fetchedSections)),
            [localSections, fetchedSections],
        );

        if (isSectionsLoading && localSections.length === 0) {
            return (
                <div className={styles.loader}>
                    <InlineLoader size={2} />
                </div>
            );
        }

        if (sectionsFetchError && localSections.length === 0) {
            return (
                <div className={styles.error}>
                    <p className={styles['error-text']}>{PARTNERS_TEXT.MESSAGE.FAIL_TO_LOAD_PARTNERS}</p>
                    <button onClick={() => refetchSections()} className={styles['error-text-button']}>
                        {PARTNERS_TEXT.BUTTON.TRY_AGAIN}
                    </button>
                </div>
            );
        }

        return (
            <div className={styles.root}>
                {localSections.map((section, index) => (
                    <PartnerSectionForm
                        key={section.localId}
                        value={section}
                        errors={errors[index] || { partners: [] }}
                        disabled={isSectionsLoading || isPublishing || (!isBaseLanguage && isLoadingTranslations)}
                        isDirty={sectionDirtyStates[index]}
                        onChange={handleChange}
                        onDelete={handleDeleteRequest}
                        onPublish={handlePublishRequest}
                        onTranslate={handleOpenTranslate}
                        localizations={fetchedSections.find((s) => s.id === section.sectionId)?.localizations ?? []}
                        translationLanguages={translationLanguages}
                        language={language}
                        translatedContent={
                            section.sectionId !== null ? (sectionTranslations[section.sectionId] ?? null) : null
                        }
                        disableStructuralActions={!isBaseLanguage}
                    />
                ))}
                <div ref={scrollAnchorRef} />

                <ConfirmationModal
                    isOpen={deletePhase === DeletePhase.CONFIRM_SECTION}
                    onClose={handleCloseModal}
                    title={PARTNERS_TEXT.FORM.TITLE.DELETE_SECTION}
                    onConfirm={handleFirstConfirm}
                    onCancel={handleCloseModal}
                />
                <ConfirmationModal
                    isOpen={deletePhase === DeletePhase.CONFIRM_PARTNERS}
                    onClose={handleCloseModal}
                    title={PARTNERS_TEXT.FORM.MESSAGE.DELETE_SECTION_WARNING}
                    onConfirm={handleFinalConfirmDelete}
                    onCancel={handleCloseModal}
                />

                <ConfirmationModal
                    isOpen={isPublishModalOpen}
                    onClose={handleClosePublishModal}
                    title={PARTNERS_TEXT.FORM.TITLE.PUBLISH_SECTION}
                    onConfirm={handleConfirmPublish}
                    onCancel={handleClosePublishModal}
                />

                <TranslatePartnerSectionModal
                    isOpen={translatingSectionId !== null}
                    onClose={handleCloseTranslate}
                    section={sectionToTranslate}
                    translatedLanguages={translationLanguages}
                    onTranslated={handleTranslated}
                />
            </div>
        );
    },
);

PartnerSectionsEditor.displayName = 'PartnerSectionsEditor';
