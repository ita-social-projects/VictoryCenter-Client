import React, { useRef, useState, useCallback, useEffect } from 'react';
import { PartnerPageToolbar } from '../partner-page-toolbar/PartnerPageToolbar';
import { PartnerBannerForm, PartnerBannerFormRef, PartnerBannerFormValues } from '../partner-banner-form/PartnerBannerForm';
import { PartnerSectionForm } from '../partner-section-form/PartnerSectionForm';
import { DeletePartnerSectionModal } from '../delete-partner-section-modal/DeletePartnerSectionModal';
import { useAdminClient } from '../../../../../hooks/admin/use-admin-client/useAdminClient';
import { PartnersApi } from '../../../../../services/api/admin/partners/partners-api';
import { Partner, PartnerSection, PartnerSectionFormValues } from '../../../../../types/admin/partners';
import { useToast } from '../../../../../contexts/admin/toast-context-provider/ToastContextProvider';
import { ToastType } from '../../../../../types/admin/toast';
import { ImageApi } from '../../../../../services/api/admin/image/image-api';
import { ImageValues } from '../../../../../types/common/image';

export const PartnerPanelContent = () => {
    const client = useAdminClient();
    const { addToast } = useToast();
    
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
        partners: []
    });
    
    // State для управління
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingSectionId, setEditingSectionId] = useState<number | null>(null);

    // Завантаження даних при монтуванні
    useEffect(() => {
        loadPartnerData();
    }, []);

    // Завантаження всіх даних партнерів
    const loadPartnerData = async () => {
        setIsLoadingBanner(true);
        setIsLoadingSections(true);
        
        try {
            const data = await PartnersApi.getAll(client);
            
            // Встановлення даних банера
            if (data.banner) {
                setBannerData({
                    title: data.banner.title || '',
                    description: data.banner.description || '',
                    image: data.banner.image,
                    imageId: data.banner.image?.id || null
                });
            }
            
            // Встановлення секцій
            if (data.section) {
                const formattedSections: PartnerSection[] = data.section.map(section => ({
                    id: section.id,
                    title: section.title,
                    description: section.description,
                    partners: section.partners.map(partner => ({
                        id: partner.id,
                        description: partner.description,
                        image: partner.image,
                        imageId: partner.image?.id || null
                    }))
                }));
                setPartnerSections(formattedSections);
            }
        } catch (error) {
            console.error('Error loading partner data:', error);
        } finally {
            setIsLoadingBanner(false);
            setIsLoadingSections(false);
        }
    };

    // Обробник відправки банера
    const handleBannerSubmit = useCallback(async (data: PartnerBannerFormValues, isPublishing: boolean) => {
        setIsSubmitting(true);
        
        try {
            await PartnersApi.updateBanner(client, {
                title: data.title,
                description: data.description,
                imageId: data.imageId || 0,
                image: data.image
            });
            
            addToast(
                isPublishing 
                    ? 'Банер партнерів успішно опубліковано' 
                    : 'Банер партнерів збережено як чернетку',
            );
            
            // Оновлення локального стану
            setBannerData(data);
        } catch (error) {
            console.error('Error saving partner banner:', error);
        } finally {
            setIsSubmitting(false);
        }
    }, [client]);

    // Обробник додавання нової секції партнерів
    const handleAddPartnerSection = useCallback(() => {
        setShowNewSection(true);
        setNewSectionData({
            title: '',
            description: '',
            partners: []
        });
    }, []);

    // Обробник збереження нової секції
    const handleSaveNewSection = useCallback(async () => {
        if (!newSectionData.title || !newSectionData.description) {
            return;
        }

        setIsSubmitting(true);
        
        try {
            // Підготовка даних для API
            const partnersData = await Promise.all(
                newSectionData.partners.map(async (partner) => {
                    let imageId: number | null = null;
                    
                    if (partner.image && 'base64' in partner.image) {
                        // Завантаження зображення через ImageApi
                        const imageResponse = await ImageApi.post(client, partner.image);
                        imageId = imageResponse.id;
                    }
                    
                    return {
                        description: partner.description,
                        imageId: imageId || 0
                    };
                })
            );

            const newSection = await PartnersApi.postSection(client, {
                title: newSectionData.title,
                description: newSectionData.description,
                partners: partnersData
            });
            
            // Додавання нової секції до списку
            setPartnerSections([...partnerSections, newSection]);
            setShowNewSection(false);
            setNewSectionData({ title: '', description: '', partners: [] });
            
        } catch (error) {
            console.error('Error adding partner section:', error);
        } finally {
            setIsSubmitting(false);
        }
    }, [client, newSectionData, partnerSections]);

    // Обробник видалення секції
    const handleDeleteSection = useCallback((section: PartnerSection) => {
        setSectionToDelete(section);
        setShowDeleteModal(true);
    }, []);

    // Підтвердження видалення секції
    const handleConfirmDelete = useCallback((deletedSection: PartnerSection) => {
        setPartnerSections(prev => prev.filter(s => s.id !== deletedSection.id));
        setShowDeleteModal(false);
        setSectionToDelete(null);
    }, [addToast]);

    // Обробник публікації секції
    const handlePublishSection = useCallback(async (sectionId: number) => {
        const section = partnerSections.find(s => s.id === sectionId);
        if (!section) return;

        setIsSubmitting(true);
        
        try {
            // Тут має бути API виклик для публікації секції
            // await PartnersApi.publishSection(client, sectionId);
            
        } catch (error) {
            console.error('Error publishing section:', error);
        } finally {
            setIsSubmitting(false);
        }
    }, [partnerSections, client]);

    // Обробник оновлення існуючої секції
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
                <div className="loading-spinner">Завантаження...</div>
            </div>
        );
    }

    return (
        <></>
    );
};