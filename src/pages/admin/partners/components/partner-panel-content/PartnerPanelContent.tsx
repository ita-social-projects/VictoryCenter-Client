import React, { useRef, useState, useCallback, useEffect } from 'react';
import { PartnerPageToolbar } from '../partner-page-toolbar/PartnerPageToolbar';
import {
    PartnerBannerForm,
    PartnerBannerFormRef,
    PartnerBannerFormValues,
} from '../partner-banner-form/PartnerBannerForm';
import { PartnerSectionForm } from '../partner-section-form/PartnerSectionForm';
import { DeletePartnerSectionModal } from '../delete-partner-section-modal/DeletePartnerSectionModal';
import { useAdminClient } from '../../../../../hooks/admin/use-admin-client/useAdminClient';
import { PartnersApi } from '../../../../../services/api/admin/partners/partners-api';
import { Partner, PartnerSection, PartnerSectionFormValues } from '../../../../../types/admin/partners';
import { ImageApi } from '../../../../../services/api/admin/image/image-api';
import { InlineLoader } from '../../../../../components/common/inline-loader/InlineLoader';
import { useToast } from '../../../../../contexts/admin/toast-context-provider/ToastContextProvider';
import { ToastType } from '../../../../../types/admin/toast';
import { PARTNERS_TEXT } from '../../../../../const/admin/partners';
import { ToastContainer } from '../../../../../components/admin/toast/toast-container/ToastContainer';
import axios from 'axios';

export const PartnerPanelContent = () => {
    const { addToast } = useToast();
    const client = useAdminClient();
    // Refs
    const bannerFormRef = useRef<PartnerBannerFormRef>(null);

    // State для банера
    const [bannerData, setBannerData] = useState<PartnerBannerFormValues | null>(null);
    const [isLoadingBanner, setIsLoadingBanner] = useState(false);

    // State для секцій партнерів
    const [partnerSections, setPartnerSections] = useState<PartnerSection[]>([]);
    const [isLoadingSections, setIsLoadingSections] = useState(false);

    // State для модального вікна видалення
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [sectionToDelete, setSectionToDelete] = useState<PartnerSection | null>(null);

    // State для додавання нової секції
    const [showNewSection, setShowNewSection] = useState(false);
    const [newSectionData, setNewSectionData] = useState<PartnerSectionFormValues>({
        title: '',
        description: '',
        partners: [],
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingSectionId, setEditingSectionId] = useState<number | null>(null);

    useEffect(() => {
        loadPartnerData();
    }, []);

    const loadPartnerData = async () => {
        setIsLoadingBanner(true);
        setIsLoadingSections(true);

        try {
            const data = await PartnersApi.getAll(client);

            if (data.banner) {
                setBannerData({
                    title: data.banner.title || '',
                    description: data.banner.description || '',
                    image: data.banner.image,
                    imageId: data.banner.image?.id || null,
                });
            }

            if (data.section) {
                const formattedSections: PartnerSection[] = data.section.map((section) => ({
                    id: section.id,
                    title: section.title,
                    description: section.description,
                    partners: section.partners.map((partner) => ({
                        id: partner.id,
                        description: partner.description,
                        image: partner.image,
                        imageId: partner.image?.id || null,
                    })),
                }));
                setPartnerSections(formattedSections);
            }
        } catch (error: any) {
            if (axios.isCancel?.(error) || error.name === 'CanceledError' || error.name === 'AbortError') {
                return;
            }
            addToast(PARTNERS_TEXT.MESSAGE.FAIL_TO_LOAD_PARTNERS, ToastType.Error);
        } finally {
            setIsLoadingBanner(false);
            setIsLoadingSections(false);
        }
    };

    const handleBannerSubmit = useCallback(
        async (data: PartnerBannerFormValues, isPublishing: boolean) => {
            setIsSubmitting(true);

            try {
                const updatedBanner = await PartnersApi.updateBanner(client, {
                    title: data.title,
                    description: data.description,
                    imageId: data.imageId || 0,
                    image: data.image,
                });
                setBannerData({
                    title: updatedBanner.title || '',
                    description: updatedBanner.description || '',
                    image: updatedBanner.image,
                    imageId: updatedBanner.image?.id || null,
                });
                addToast(PARTNERS_TEXT.MESSAGE.BANNER_SAVED, ToastType.Success);
            } catch (error: any) {
                if (axios.isCancel?.(error) || error.name === 'CanceledError' || error.name === 'AbortError') {
                    return;
                }
                addToast(PARTNERS_TEXT.MESSAGE.FAIL_TO_UPDATE_BANNER, ToastType.Error);
            } finally {
                setIsSubmitting(false);
            }
        },
        [client, addToast],
    );

    const handleAddPartnerSection = useCallback(() => {
        setShowNewSection(true);
        setNewSectionData({
            title: '',
            description: '',
            partners: [],
        });
    }, []);

    const handleSaveNewSection = useCallback(async () => {
        if (!newSectionData.title || !newSectionData.description) {
            return;
        }

        setIsSubmitting(true);

        try {
            const partnersData = await Promise.all(
                newSectionData.partners.map(async (partner) => {
                    let imageId: number | null = null;

                    if (partner.image && 'base64' in partner.image) {
                        const imageResponse = await ImageApi.post(client, partner.image);
                        imageId = imageResponse.id;
                    }

                    return {
                        description: partner.description,
                        imageId: imageId || 0,
                    };
                }),
            );

            const newSection = await PartnersApi.postSection(client, {
                title: newSectionData.title,
                description: newSectionData.description,
                partners: partnersData,
            });

            setPartnerSections([...partnerSections, newSection]);
            setShowNewSection(false);
            setNewSectionData({ title: '', description: '', partners: [] });
            addToast(PARTNERS_TEXT.MESSAGE.SECTION_CREATED, ToastType.Success);
        } catch (error: any) {
            if (axios.isCancel?.(error) || error.name === 'CanceledError' || error.name === 'AbortError') {
                return;
            }
            addToast(PARTNERS_TEXT.MESSAGE.FAIL_TO_CREATE_SECTION, ToastType.Error);
        } finally {
            setIsSubmitting(false);
        }
    }, [client, newSectionData, partnerSections, addToast]);

    const handleDeleteSection = useCallback((section: PartnerSection) => {
        setSectionToDelete(section);
        setShowDeleteModal(true);
    }, []);

    const handleConfirmDelete = useCallback((deletedSection: PartnerSection) => {
        setPartnerSections((prev) => prev.filter((s) => s.id !== deletedSection.id));
        setShowDeleteModal(false);
        setSectionToDelete(null);
    }, []);

    const handlePublishSection = useCallback(
        async (sectionId: number) => {
            const section = partnerSections.find((s) => s.id === sectionId);
            if (!section) return;

            setIsSubmitting(true);

            try {
                // Prepare section data with updated partners
                const sectionToPublish: PartnerSection = {
                    id: section.id,
                    title: section.title,
                    description: section.description,
                    partners: section.partners.map((partner) => ({
                        id: partner.id,
                        description: partner.description,
                        image: partner.image,
                        imageId: partner.imageId,
                    })),
                    isPublished: true,
                };

                // Update the section via API (API will handle image uploads if needed)
                const updatedSection = await PartnersApi.updatePartnerSection(client, sectionToPublish);

                // Update local state with published section
                setPartnerSections((prev) =>
                    prev.map((s) => (s.id === sectionId ? { ...updatedSection, isPublished: true } : s)),
                );
                addToast(PARTNERS_TEXT.MESSAGE.SECTION_PUBLISHED, ToastType.Success);
            } catch (error: any) {
                if (axios.isCancel?.(error) || error.name === 'CanceledError' || error.name === 'AbortError') {
                    return;
                }
                addToast(PARTNERS_TEXT.MESSAGE.FAIL_TO_PUBLISH_SECTION, ToastType.Error);
            } finally {
                setIsSubmitting(false);
            }
        },
        [partnerSections, client, addToast],
    );

    const handleUpdateSection = useCallback((updatedSection: PartnerSectionFormValues, sectionId: number) => {
        setPartnerSections((prev) =>
            prev.map((section) => {
                if (section.id !== sectionId) return section;

                const updatedPartners: Partner[] = updatedSection.partners.map((p, index) => {
                    const existing = section.partners[index];
                    let nextImageId: number | null = existing?.imageId ?? null;
                    if (p.image && typeof p.image === 'object' && 'id' in p.image) {
                        nextImageId = (p.image as any).id as number;
                    }

                    return {
                        id: existing?.id ?? 0,
                        description: p.description,
                        image: p.image,
                        imageId: nextImageId,
                    };
                });

                return {
                    ...section,
                    title: updatedSection.title,
                    description: updatedSection.description,
                    partners: updatedPartners,
                };
            }),
        );
    }, []);

    if (isLoadingBanner || isLoadingSections) {
        return (
            <div className="partner-panel-wrapper loading">
                <InlineLoader size={3} />
            </div>
        );
    }

    return (
        <div>
            <div className="partner-panel-toolbar-container">
                <PartnerPageToolbar onAddPartner={handleAddPartnerSection} />
            </div>

            <div className="partner-panel-content">
                {/* Banner Section */}
                <div className="partner-banner-section">
                    <PartnerBannerForm
                        ref={bannerFormRef}
                        initialData={bannerData}
                        onSubmit={handleBannerSubmit}
                        formDisabled={isSubmitting}
                    />
                </div>

                {/* New Section Form */}
                {showNewSection && (
                    <div className="partner-new-section">
                        <PartnerSectionForm
                            value={newSectionData}
                            onChange={setNewSectionData}
                            onDelete={() => {
                                setShowNewSection(false);
                                setNewSectionData({ title: '', description: '', partners: [] });
                            }}
                            onEdit={() => {}}
                            onPublish={handleSaveNewSection}
                            disabled={isSubmitting}
                        />
                    </div>
                )}

                {/* Existing Partner Sections */}
                <div className="partner-sections-list">
                    {partnerSections.map((section) => (
                        <div key={section.id} className="partner-section-item">
                            <PartnerSectionForm
                                value={{
                                    title: section.title,
                                    description: section.description,
                                    partners: section.partners.map((p) => ({
                                        image: p.image,
                                        description: p.description,
                                    })),
                                }}
                                onChange={(data) => handleUpdateSection(data, section.id)}
                                onDelete={() => handleDeleteSection(section)}
                                onEdit={() => handleUpdateSection(section, section.id)}
                                onPublish={() => handlePublishSection(section.id)}
                                disabled={isSubmitting || editingSectionId === section.id}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <DeletePartnerSectionModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSectionToDelete(null);
                }}
                sectionToDelete={sectionToDelete}
                onDeleteSection={handleConfirmDelete}
            />

            {/* Toast Container */}
            <ToastContainer />
        </div>
    );
};
