import { useCallback, useEffect, useState } from 'react';
import { WhoWeAreApi } from '../../../../../services/api/admin/who-we-are/who-we-are-api';
import { Content, ContentType, WhoWeAreCategory, WhoWeAreSection } from '../../../../../types/admin/who-we-are';
import { useAdminClient } from '../../../../../hooks/admin/use-admin-client/useAdminClient';
import { CategoryBar } from '../../../../../components/admin/category-bar/CategoryBar';
import axios from 'axios';
import './WhoWeAreContent.scss';
import { MainSection } from '../sections/main-section/MainSection';
import { CardsSection } from '../sections/cards-section/CardsSection';
import { DescriptionSection } from '../sections/description-section/DescriptionSection';

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
    const [contentToUpdate, setContentToUpdate] = useState<Content[]>([]);

    const clearError = useCallback(() => {
        setError({ message: null, type: null });
    }, []);

    const handleCategorySelect = useCallback((category: WhoWeAreCategory) => {
        setSelectedCategory(category);
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
                if (updatedItem.contentType === ContentType.Image || updatedItem.contentType === ContentType.Card) {
                    updatedItem.imageId = updatedItem.id ?? null;
                }
                return JSON.stringify(updatedItem) !== JSON.stringify(originalItem);
            }
        });

        if (selectedCategory && changedContents.length > 0) {
            const result = await WhoWeAreApi.UpdateContent(client, changedContents, selectedCategory.sectionType);

            // 3. Оновлюємо selectedSection (повністю) і updatedSection частково
            setSelectedSection(result);

            setUpdatedSection((prev) => {
                if (!prev) return null;

                const newContents = prev.contents.map((item) => {
                    const updated = changedContents.find((c) => c.id === item.id);
                    return updated ?? item;
                });

                return { ...prev, contents: newContents };
            });
        }
    }, [selectedSection, updatedSection, client, selectedCategory]);

    return (
        <div className="who-we-are-main-box">
            <CategoryBar<WhoWeAreCategory>
                categories={categories}
                selectedCategory={selectedCategory}
                getCategoryDisplayName={(category) => category.title}
                getCategoryKey={(category) => category.id}
                onCategorySelect={handleCategorySelect}
                displayContextMenuButton={false}
            />
            <MainSection section={updatedSection} onChange={handleContentChange} onPublish={handlePublishChange} />
        </div>
    );
};
