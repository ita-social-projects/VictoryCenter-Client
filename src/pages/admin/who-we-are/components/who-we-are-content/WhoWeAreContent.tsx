import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { WhoWeAreApi } from '@api/admin/who-we-are/who-we-are-api';
import { Content, WhoWeAreCategory, WhoWeAreSection } from '@app-types/admin/who-we-are';
import { useAdminClient } from '@hooks/admin/use-admin-client/useAdminClient';
import { CategoryBar } from '@components/admin/category-bar/CategoryBar';
import './WhoWeAreContent.scss';
import { SectionsWrapper } from '../sections-wrapper/SectionsWrapper';
import { Image } from '@app-types/common/image';
import { ConfirmationModal } from '@components/admin/confirmation-modal/ConfirmationModal';
import { COMMON_TEXT_ADMIN } from '@const/admin/common';
import { ToastType } from '@app-types/admin/toast';
import { ToastContainer } from '@components/admin/toast/toast-container/ToastContainer';
import { useToast } from '@contexts/admin/toast-context-provider/ToastContextProvider';
import { useDataFetch } from '@hooks/common/use-data-fetch/useDataFetch';
import { WHO_WE_ARE_TEXT } from '@const/admin/who-we-are';
import { InlineLoader } from '@components/common/inline-loader/InlineLoader';
import classNames from 'classnames';

interface ErrorState {
    message: string | null;
    type: 'categories' | 'entity' | null;
}

function isExistingImage(image: any): image is Image {
    return image !== null && typeof image === 'object' && 'id' in image && 'url' in image;
}

export const WhoWeAreContent = () => {
    const client = useAdminClient();
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

    const {
        data: categories,
        error: categoryError,
        isLoading: isCategoriesLoading,
        refetch: refetchCategories,
    } = useDataFetch<WhoWeAreCategory[]>({
        initialData: [],
        fetchHandler: getCategories,
        autoFetchDependencies: [getCategories],
    });

    const {
        data: fetchedSection,
        error: sectionError,
        isLoading: isSectionLoading,
        refetch: refetchSection,
    } = useDataFetch<WhoWeAreSection | null>({
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

    const error = useMemo<ErrorState>(() => {
        if (categoryError) {
            return { message: WHO_WE_ARE_TEXT.FAIL_TO_FETCH_PREVIEWS, type: 'categories' };
        }
        if (sectionError) {
            return { message: WHO_WE_ARE_TEXT.FAIL_TO_FETCH_SECTION, type: 'entity' };
        }
        return { message: null, type: null };
    }, [categoryError, sectionError]);

    const handleRetry = useCallback(() => {
        if (error.type === 'categories') {
            refetchCategories();
        } else if (error.type === 'entity') {
            refetchSection();
        }
    }, [error.type, refetchCategories, refetchSection]);

    const isLoading = isCategoriesLoading || isSectionLoading;
    const isPending = isLoading || !!error.message;

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="who-we-are-main-box-loader">
                    <InlineLoader size={3} />
                </div>
            );
        }

        if (error.message) {
            return (
                <div className="who-we-are-main-box-error-message">
                    <p>{error.message}</p>
                    <button onClick={handleRetry} type="button" className="retry-link">
                        {COMMON_TEXT_ADMIN.BUTTON.TRY_AGAIN}
                    </button>
                </div>
            );
        }

        return (
            <SectionsWrapper
                section={updatedSection}
                onChange={handleContentChange}
                onPublish={() => setConfirmationModalOpen(true)}
                setIsPublishButtonActive={(value) => setIsPublishButtonActive(value)}
                isPublishButtonActive={isPublishButtonActive}
            />
        );
    };

    return (
        <>
            <div className={classNames('who-we-are-main-box', { 'who-we-are-main-box--pending': isPending })}>
                <CategoryBar<WhoWeAreCategory>
                    categories={categories}
                    selectedCategory={selectedCategory}
                    getCategoryDisplayName={(category) => category.title}
                    getCategoryKey={(category) => category.id}
                    onCategorySelect={handleCategorySelect}
                />

                {renderContent()}
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
