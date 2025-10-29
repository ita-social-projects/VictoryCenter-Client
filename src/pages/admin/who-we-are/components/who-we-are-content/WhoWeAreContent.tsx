import React, { useCallback, useEffect, useState } from 'react';
import { WhoWeAreApi } from '../../../../../services/api/admin/who-we-are/who-we-are-api';
import { Content, WhoWeAreCategory, WhoWeAreSection } from '../../../../../types/admin/who-we-are';
import { useAdminClient } from '../../../../../hooks/admin/use-admin-client/useAdminClient';
import { CategoryBar } from '../../../../../components/admin/category-bar/CategoryBar';
import './WhoWeAreContent.scss';
import { SectionsWrapper } from '../sections-wrapper/SectionsWrapper';
import { Image } from '../../../../../types/common/image';
import { ConfirmationModal } from '../../../../../components/admin/confirmation-modal/ConfirmationModal';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { ToastType } from '../../../../../types/admin/toast';
import { ToastContainer } from '../../../../../components/admin/toast/toast-container/ToastContainer';
import { useToast } from '../../../../../contexts/admin/toast-context-provider/ToastContextProvider';
import { useDataFetch } from '../../../../../hooks/common/use-data-fetch/useDataFetch';
import { WHO_WE_ARE_TEXT } from '../../../../../const/admin/who-we-are';

interface ErrorState {
    message: string | null;
    type: 'categories' | 'entity' | null;
}

function isExistingImage(image: any): image is Image {
    return image !== null && typeof image === 'object' && 'id' in image && 'url' in image;
}

export const WhoWeAreContent = () => {
    const client = useAdminClient();
    const [error, setError] = useState<ErrorState>({ message: null, type: null });
    const [selectedCategory, setSelectedCategory] = useState<WhoWeAreCategory | null>(null);
    const [selectedSection, setSelectedSection] = useState<WhoWeAreSection | null>(null);
    const [updatedSection, setUpdatedSection] = useState<WhoWeAreSection | null>(null);
    const [isConfirmationModalOpen, setConfirmationModalOpen] = useState<boolean>(false);
    const [isPublishButtonActive, setIsPublishButtonActive] = useState<boolean>(false);

    const { addToast } = useToast();

    const getCategories = useCallback(async () => {
        const categories = await WhoWeAreApi.getPreviews(client);
        return categories;
    }, [client]);

    const getSection = useCallback(async () => {
        if (!selectedCategory) return null;
        const section = await WhoWeAreApi.getByType(client, selectedCategory.sectionType);
        return section;
    }, [client, selectedCategory]);

    const { data: categories, error: categoryError } = useDataFetch<WhoWeAreCategory[]>({
        initialData: [],
        fetchHandler: getCategories,
        autoFetchDependencies: [getCategories],
    });

    const { data: fetchedSection, error: sectionError } = useDataFetch<WhoWeAreSection | null>({
        initialData: null,
        fetchHandler: getSection,
        autoFetchDependencies: [getSection],
    });

    useEffect(() => {
        if (categories && categories.length > 0 && !selectedCategory) {
            setSelectedCategory(categories[0]);
        }
    }, [categories, selectedCategory]);

    useEffect(() => {
        if (fetchedSection) {
            setSelectedSection(fetchedSection);
            setUpdatedSection(fetchedSection);
        }
    }, [fetchedSection]);

    useEffect(() => {
        if (categoryError) {
            setError({ message: WHO_WE_ARE_TEXT.FAIL_TO_FETCH_PREVIEWS, type: 'categories' });
        }
    }, [categoryError]);

    useEffect(() => {
        if (sectionError) {
            setError({ message: WHO_WE_ARE_TEXT.FAIL_TO_FETCH_SECTION, type: 'entity' });
        }
    }, [sectionError]);

    const handleCategorySelect = useCallback((category: WhoWeAreCategory) => {
        setSelectedCategory(category);
        setIsPublishButtonActive(false);
    }, []);

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

        if (selectedCategory && changedContents.length > 0) {
            try {
                const result = await WhoWeAreApi.updateContent(client, changedContents, selectedCategory.sectionType);

                setSelectedSection(result);
                setUpdatedSection(result);
                setIsPublishButtonActive(false);
                addToast(COMMON_TEXT_ADMIN.MESSAGE.SUCCESSFULLY_PUBLISHED, ToastType.Info);
            } catch (error) {
                addToast(COMMON_TEXT_ADMIN.MESSAGE.FAIL_TO_PUBLISH_CHANGES, ToastType.Error);
            }
        }
    }, [selectedSection, updatedSection, client, selectedCategory, addToast]);

    const handleConfirmPublish = useCallback(() => {
        setConfirmationModalOpen(false);
        handlePublishChange();
    }, [handlePublishChange]);

    return (
        <>
            <div className="who-we-are-main-box">
                <CategoryBar<WhoWeAreCategory>
                    categories={categories}
                    selectedCategory={selectedCategory}
                    getCategoryDisplayName={(category) => category.title}
                    getCategoryKey={(category) => category.id}
                    onCategorySelect={handleCategorySelect}
                />

                {error.message && (
                    <div className="who-we-are-main-box-error-message">
                        <p>{error.message}</p>
                    </div>
                )}

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
                onConfirm={handleConfirmPublish}
                onCancel={() => setConfirmationModalOpen(false)}
            />
            <ToastContainer />
        </>
    );
};
