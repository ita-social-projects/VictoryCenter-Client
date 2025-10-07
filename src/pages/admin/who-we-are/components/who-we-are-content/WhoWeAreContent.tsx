import React, { useCallback, useEffect, useState } from 'react';
import { WhoWeAreApi } from '../../../../../services/api/admin/who-we-are/who-we-are-api';
import { Content, WhoWeAreCategory, WhoWeAreSection } from '../../../../../types/admin/who-we-are';
import { useAdminClient } from '../../../../../hooks/admin/use-admin-client/useAdminClient';
import { CategoryBar } from '../../../../../components/admin/category-bar/CategoryBar';
import axios from 'axios';
import './WhoWeAreContent.scss';
import { SectionsWrapper } from '../sections-wrapper/SectionsWrapper';
import { Image } from '../../../../../types/common/image';
import { ConfirmationModal } from '../../../../../components/admin/confirmation-modal/ConfirmationModal';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { ToastType } from '../../../../../types/admin/toast';
import { ToastContainer } from '../../../../../components/admin/toast/toast-container/ToastContainer';
import { useToast } from '../../../../../contexts/admin/toast-context-provider/ToastContextProvider';

interface ErrorState {
    message: string | null;
    type: 'categories' | 'entity' | null;
}

export const WhoWeAreContent = () => {
    const client = useAdminClient();
    const [categories, setCategories] = useState<WhoWeAreCategory[]>([]);
    const [error, setError] = useState<ErrorState>({ message: null, type: null });
    const [selectedCategory, setSelectedCategory] = useState<WhoWeAreCategory | null>(null);
    const [selectedSection, setSelectedSection] = useState<WhoWeAreSection | null>(null);
    const [updatedSection, setUpdatedSection] = useState<WhoWeAreSection | null>(null);
    const [isConfirmationModalOpen, setConfirmationModalOpen] = useState<boolean>(false);
    const [isPublishButtonActive, setIsPublishButtonActive] = useState<boolean>(false);

    const { addToast } = useToast();

    const handleCategorySelect = useCallback((category: WhoWeAreCategory) => {
        setSelectedCategory(category);
        setIsPublishButtonActive(false);
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const fetchedCategories = await WhoWeAreApi.getAll(client);
            if (fetchedCategories.length > 0) {
                setCategories(fetchedCategories);
                setSelectedCategory(fetchedCategories[0]);
            }
        } catch (error: any) {
            if (axios.isCancel?.(error) || error.name === 'CanceledError' || error.name === 'AbortError') {
                return;
            }
            setError({ message: 'Failed to load categories', type: 'categories' });
        }
    }, [client]);

    const fetchSection = useCallback(async () => {
        if (!selectedCategory) return;
        try {
            const fetchedSection = await WhoWeAreApi.getByType(client, selectedCategory.sectionType);
            if (fetchedSection) {
                setSelectedSection(fetchedSection);
                setUpdatedSection(fetchedSection);
            }
        } catch (error: any) {
            if (axios.isCancel?.(error) || error.name === 'CanceledError' || error.name === 'AbortError') {
                return;
            }
            setError({ message: 'Failed to load section', type: 'entity' });
        }
    }, [client, selectedCategory]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        fetchSection();
    }, [fetchSection]);

    const handleContentChange = useCallback((updatedContent: Content) => {
        setUpdatedSection((prevSection) => {
            if (!prevSection) return null;

            const newContents = prevSection.contents.map((item) =>
                item.id === updatedContent.id ? updatedContent : item,
            );

            return {
                ...prevSection,
                contents: newContents,
            };
        });
    }, []);

    const handlePublishChange = useCallback(async () => {
        if (!selectedSection || !updatedSection) return;

        const changedContents = updatedSection.contents.filter((updatedItem) => {
            const originalItem = selectedSection.contents.find((sel) => sel.id === updatedItem.id);

            if (!originalItem) return true;
            else {
                if (isExistingImage(updatedItem.image)) {
                    updatedItem.imageId = updatedItem.image?.id ?? null;
                }
                return JSON.stringify(updatedItem) !== JSON.stringify(originalItem);
            }
        });

        function isExistingImage(image: any): image is Image {
            return image !== null && typeof image === 'object' && 'id' in image && 'url' in image;
        }

        if (selectedCategory && changedContents.length > 0) {
            const result = await WhoWeAreApi.updateContent(client, changedContents, selectedCategory.sectionType);

            setSelectedSection(result);
            setUpdatedSection(result);
            setIsPublishButtonActive(false);
            addToast(COMMON_TEXT_ADMIN.MESSAGE.SUCCESSFULLY_PUBLISHED, ToastType.Info);
        }
    }, [selectedSection, updatedSection, client, selectedCategory, addToast]);

    return (
        <>
            <div className="who-we-are-main-box">
                {error.message && (
                    <div className="error-message">
                        <p>{error.message}</p>
                    </div>
                )}
                <CategoryBar<WhoWeAreCategory>
                    categories={categories}
                    selectedCategory={selectedCategory}
                    getCategoryDisplayName={(category) => category.title}
                    getCategoryKey={(category) => category.id}
                    onCategorySelect={handleCategorySelect}
                />
                <SectionsWrapper
                    section={updatedSection}
                    onChange={handleContentChange}
                    onPublish={() => setConfirmationModalOpen(true)}
                    setIsPublishButtonActive={(value) => setIsPublishButtonActive(value)}
                    isPublishButtonActive={isPublishButtonActive}
                />
            </div>
            <ConfirmationModal
                isOpen={isConfirmationModalOpen}
                onClose={() => setConfirmationModalOpen(false)}
                title={COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES}
                onConfirm={() => {
                    setConfirmationModalOpen(false);
                    handlePublishChange();
                }}
                onCancel={() => setConfirmationModalOpen(false)}
            />
            <ToastContainer />
        </>
    );
};
