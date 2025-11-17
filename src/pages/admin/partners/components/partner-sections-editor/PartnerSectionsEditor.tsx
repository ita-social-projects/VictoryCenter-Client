import React, { forwardRef, useCallback, useImperativeHandle, useState, useEffect } from 'react';
import {
    PartnerSectionForm,
    PartnerSectionErrors,
    PartnerSectionFormValues,
} from '../partner-section/PartnerSectionForm';
import { RequestOptions } from '../../../../../types/common/api';
import { ToastType } from '../../../../../types/admin/toast';
import { PARTNERS_TEXT } from '../../../../../const/admin/partners';
import axios from 'axios';
import { PartnerFormValues } from '../partner-form/PartnerForm';
import { PartnersApi } from '../../../../../services/api/admin/partners/partners-api';
import { useToast } from '../../../../../contexts/admin/toast-context-provider/ToastContextProvider';
import { useDataFetch } from '../../../../../hooks/common/use-data-fetch/useDataFetch';
import { ConfirmationModal } from '../../../../../components/admin/confirmation-modal/ConfirmationModal';
import { useAdminClient } from '../../../../../hooks/admin/use-admin-client/useAdminClient';
import { InlineLoader } from '../../../../../components/common/inline-loader/InlineLoader';
import {
    Partner,
    PartnerSection,
    PartnersSectionCreateRequest,
    PartnersSectionUpdateRequest,
} from '../../../../../types/admin/partners';
import './PartnerSectionsEditor.scss';

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

export interface PartnerSectionsEditorRef {
    addSection: () => void;
}

export const PartnerSectionsEditor = forwardRef<PartnerSectionsEditorRef>((_, ref) => {
    const client = useAdminClient();
    const { addToast } = useToast();
    const [errors, setErrors] = useState<PartnerSectionErrors[]>([]);
    const [isPublishing, setIsPublishing] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [sectionToDeleteId, setSectionToDeleteId] = useState<string | null>(null);
    const [localSections, setLocalSections] = useState<PartnerSectionFormValues[]>([]);

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
    } = useDataFetch<PartnerSection[]>({
        initialData: [],
        fetchHandler: fetchSectionsHandler,
        autoFetchDisabled: false,
    });

    useEffect(() => {
        setErrors(fetchedSections.map(() => ({ partners: [] })));
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

    const handlePublish = useCallback(
        async (localId: string) => {
            setIsPublishing(true);
            try {
                const sectionToPublish = localSections.find((s) => s.localId === localId);
                if (!sectionToPublish) return;

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
                    if (s.localId === localId) {
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
            } catch (error: any) {
                if (axios.isCancel?.(error) || error.name === 'CanceledError' || error.name === 'AbortError') {
                    return;
                }
                addToast(PARTNERS_TEXT.MESSAGE.FAIL_TO_PUBLISH_SECTION, ToastType.Error);
            } finally {
                setIsPublishing(false);
            }
        },
        [localSections, addToast, client, setLocalSections],
    );

    const handleDeleteRequest = useCallback((localId: string) => {
        setSectionToDeleteId(localId);
        setIsModalOpen(true);
    }, []);

    const handleCloseModal = useCallback(() => {
        setIsModalOpen(false);
        setSectionToDeleteId(null);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        if (!sectionToDeleteId) return;

        setIsPublishing(true);
        setIsModalOpen(false);

        try {
            const sectionToDelete = localSections.find((s) => s.localId === sectionToDeleteId);

            if (sectionToDelete && sectionToDelete.sectionId) {
                await PartnersApi.deleteSection(client, sectionToDelete.sectionId);
            }

            const indexToDelete = localSections.findIndex((s) => s.localId === sectionToDeleteId);
            setLocalSections((current) => current.filter((s) => s.localId !== sectionToDeleteId));
            setErrors((current) => current.filter((_, i) => i !== indexToDelete));

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
    }, [localSections, client, setLocalSections, sectionToDeleteId, addToast]);

    const addSection = useCallback(() => {
        if (isPublishing || isSectionsLoading) {
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
    }, [isPublishing, isSectionsLoading, localSections, setLocalSections, setErrors]);

    useImperativeHandle(
        ref,
        () => ({
            addSection: addSection,
        }),
        [addSection],
    );

    if (isSectionsLoading && localSections.length === 0) {
        return (
            <div className="partner-section__loader">
                <InlineLoader size={2} />
            </div>
        );
    }

    if (sectionsFetchError && localSections.length === 0) {
        return (
            <div className="partner-sections-editor__error">
                <p className="partner-sections-editor__error-text">{PARTNERS_TEXT.MESSAGE.FAIL_TO_LOAD_PARTNERS}</p>
                <button onClick={refetchSections} className="partner-sections-editor__error-text-button">
                    {PARTNERS_TEXT.BUTTON.TRY_AGAIN}
                </button>
            </div>
        );
    }

    return (
        <div className="partner-sections-editor">
            {localSections.map((section, index) => (
                <PartnerSectionForm
                    key={section.localId}
                    value={section}
                    errors={errors[index] || { partners: [] }}
                    disabled={isSectionsLoading || isPublishing}
                    onChange={handleChange}
                    onDelete={handleDeleteRequest}
                    onPublish={handlePublish}
                />
            ))}

            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={PARTNERS_TEXT.FORM.TITLE.DELETE_SECTION}
                onConfirm={handleConfirmDelete}
                onCancel={handleCloseModal}
            />
        </div>
    );
});

PartnerSectionsEditor.displayName = 'PartnerSectionsEditor';
