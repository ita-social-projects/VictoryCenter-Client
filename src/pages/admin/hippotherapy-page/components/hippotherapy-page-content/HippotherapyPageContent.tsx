import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { HippotherapyPageApi } from '@/services/api/admin/hippotherapy-page/hippotherapy-page-api';
import { HippotherapyPageContentModel } from '@/types/admin/hippotherapy-page';
import { isHippotherapyPageContentValid } from '@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema';
import { HIPPOTHERAPY_PAGE_DEFAULT_IMAGE_STYLES, HIPPOTHERAPY_PAGE_TEXT } from '@/const/admin/hippotherapy-page';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { ToastType } from '@/types/admin/toast';
import { normalizeHtml } from '@/utils/functions/normalize-html/normalize-html';
import { InlineLoader } from '@/components/common/inline-loader/InlineLoader';
import { ToastContainer } from '@/components/admin/toast/toast-container/ToastContainer';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { Button } from '@/components/admin/button/Button';
import { IntroBannerSection } from '../sections/intro-banner-section/IntroBannerSection';
import { TextCardSection } from '../sections/text-card-section/TextCardSection';
import { HippotherapyQuoteSection } from '../sections/hippotherapy-quote-section/HippotherapyQuoteSection';
import { HippoventionCenterSection } from '../sections/hippovention-center-section/HippoventionCenterSection';
import { GallerySection } from '../sections/gallery-section/GallerySection';
import { ScientificReferencesSection } from '../sections/scientific-references-section/ScientificReferencesSection';
import { EthicsSection } from '../sections/ethics-section/EthicsSection';
import './HippotherapyPageContent.scss';

const normalizeContent = (content: HippotherapyPageContentModel): HippotherapyPageContentModel => ({
    introSection: {
        ...content.introSection,
        title: normalizeHtml(content.introSection.title),
        description: normalizeHtml(content.introSection.description),
    },
    descriptionSection: {
        title: normalizeHtml(content.descriptionSection.title),
        description: normalizeHtml(content.descriptionSection.description),
    },
    quoteSection: {
        ...content.quoteSection,
        quoteText: normalizeHtml(content.quoteSection.quoteText),
        authorName: normalizeHtml(content.quoteSection.authorName),
    },
    hippoventionSection: {
        title: normalizeHtml(content.hippoventionSection.title),
        description: normalizeHtml(content.hippoventionSection.description),
    },
    hippoventionCenterSection: {
        ...content.hippoventionCenterSection,
        title: normalizeHtml(content.hippoventionCenterSection.title),
        description: normalizeHtml(content.hippoventionCenterSection.description),
        pros: normalizeHtml(content.hippoventionCenterSection.pros),
    },
    advantagesSection: {
        title: normalizeHtml(content.advantagesSection.title),
        cards: content.advantagesSection.cards.map((card) => ({
            ...card,
            description: normalizeHtml(card.description),
        })),
    },
    analysisSection: {
        title: normalizeHtml(content.analysisSection.title),
        description: normalizeHtml(content.analysisSection.description),
    },
    scientificReferencesSection: {
        title: normalizeHtml(content.scientificReferencesSection.title),
        description: normalizeHtml(content.scientificReferencesSection.description),
        scientificReferences: content.scientificReferencesSection.scientificReferences.map((reference) => ({
            ...reference,
        })),
    },
    anotherQuoteSection: {
        ...content.anotherQuoteSection,
        quoteText: normalizeHtml(content.anotherQuoteSection.quoteText),
        authorName: normalizeHtml(content.anotherQuoteSection.authorName),
    },
    participantsSection: {
        title: normalizeHtml(content.participantsSection.title),
        cards: content.participantsSection.cards.map((card) => ({
            ...card,
            description: normalizeHtml(card.description),
        })),
    },
    ethicsSection: {
        ...content.ethicsSection,
        title: normalizeHtml(content.ethicsSection.title),
        description: normalizeHtml(content.ethicsSection.description),
        principles: content.ethicsSection.principles.map((principle) => normalizeHtml(principle)),
    },
});

const createBlankHippotherapyPageContent = (): HippotherapyPageContentModel => ({
    introSection: { title: '', description: '', image: null, imageId: null },
    descriptionSection: { title: '', description: '' },
    quoteSection: { quoteText: '', authorName: '', image: null, imageId: null },
    hippoventionSection: { title: '', description: '' },
    hippoventionCenterSection: {
        title: '',
        description: '',
        pros: '',
        image: null,
        imageId: null,
    },
    advantagesSection: {
        title: '',
        cards: Array.from({ length: 4 }, () => ({ description: '', image: null, imageId: null })),
    },
    analysisSection: { title: '', description: '' },
    scientificReferencesSection: {
        title: '',
        description: '',
        scientificReferences: [{ localId: crypto.randomUUID(), id: null, name: '', url: '' }],
    },
    anotherQuoteSection: { quoteText: '', authorName: '', image: null, imageId: null },
    participantsSection: {
        title: '',
        cards: Array.from({ length: 4 }, () => ({ description: '', image: null, imageId: null })),
    },
    ethicsSection: {
        title: '',
        description: '',
        principles: ['', '', '', ''],
        image: null,
        imageId: null,
    },
});

const isNotFoundError = (error: unknown): boolean => axios.isAxiosError(error) && error.response?.status === 404;

export const HippotherapyPageContent = () => {
    const client = useAdminClient();
    const { addToast } = useToast();

    const [fetchedContent, setFetchedContent] = useState<HippotherapyPageContentModel | null>(null);
    const [draftContent, setDraftContent] = useState<HippotherapyPageContentModel | null>(null);
    const [isConfirmationModalOpen, setConfirmationModalOpen] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);

    const getContent = useCallback(async () => HippotherapyPageApi.get(client), [client]);

    const {
        data: content,
        error,
        isLoading,
        refetch,
    } = useDataFetch<HippotherapyPageContentModel | null>({
        initialData: null,
        fetchHandler: getContent,
        autoFetchDependencies: [getContent],
    });

    useEffect(() => {
        if (content) {
            setFetchedContent(content);
            setDraftContent(content);
        } else if (isNotFoundError(error)) {
            const blankContent = createBlankHippotherapyPageContent();
            setFetchedContent(blankContent);
            setDraftContent(blankContent);
        }
    }, [content, error]);

    const normalizedFetchedContent = useMemo(
        () => (fetchedContent ? JSON.stringify(normalizeContent(fetchedContent)) : null),
        [fetchedContent],
    );
    const normalizedDraftContent = useMemo(
        () => (draftContent ? JSON.stringify(normalizeContent(draftContent)) : null),
        [draftContent],
    );

    const isPublishButtonActive = useMemo(() => {
        if (!normalizedFetchedContent || !normalizedDraftContent) return false;
        return normalizedFetchedContent !== normalizedDraftContent;
    }, [normalizedFetchedContent, normalizedDraftContent]);

    const isFormValid = useMemo(
        () => (draftContent ? isHippotherapyPageContentValid(draftContent) : false),
        [draftContent],
    );

    const handleSectionChange = useCallback(
        <K extends keyof HippotherapyPageContentModel>(key: K, value: HippotherapyPageContentModel[K]) => {
            setDraftContent((prev) => (prev ? { ...prev, [key]: value } : prev));
        },
        [],
    );

    const sectionHandlers = useMemo(
        () => ({
            introSection: (value: HippotherapyPageContentModel['introSection']) =>
                handleSectionChange('introSection', value),
            descriptionSection: (value: HippotherapyPageContentModel['descriptionSection']) =>
                handleSectionChange('descriptionSection', value),
            quoteSection: (value: HippotherapyPageContentModel['quoteSection']) =>
                handleSectionChange('quoteSection', value),
            hippoventionSection: (value: HippotherapyPageContentModel['hippoventionSection']) =>
                handleSectionChange('hippoventionSection', value),
            hippoventionCenterSection: (value: HippotherapyPageContentModel['hippoventionCenterSection']) =>
                handleSectionChange('hippoventionCenterSection', value),
            advantagesSection: (value: HippotherapyPageContentModel['advantagesSection']) =>
                handleSectionChange('advantagesSection', value),
            analysisSection: (value: HippotherapyPageContentModel['analysisSection']) =>
                handleSectionChange('analysisSection', value),
            scientificReferencesSection: (value: HippotherapyPageContentModel['scientificReferencesSection']) =>
                handleSectionChange('scientificReferencesSection', value),
            anotherQuoteSection: (value: HippotherapyPageContentModel['anotherQuoteSection']) =>
                handleSectionChange('anotherQuoteSection', value),
            participantsSection: (value: HippotherapyPageContentModel['participantsSection']) =>
                handleSectionChange('participantsSection', value),
            ethicsSection: (value: HippotherapyPageContentModel['ethicsSection']) =>
                handleSectionChange('ethicsSection', value),
        }),
        [handleSectionChange],
    );

    const [imageErrors, setImageErrors] = useState<Record<string, string | null>>({});
    const hasImageErrors = useMemo(() => Object.values(imageErrors).some(Boolean), [imageErrors]);

    const handleImageErrorChange = useCallback((key: string, error: string | null) => {
        setImageErrors((prev) => (prev[key] === error ? prev : { ...prev, [key]: error }));
    }, []);

    const imageErrorHandlers = useMemo(
        () => ({
            introSection: (error: string | null) => handleImageErrorChange('introSection', error),
            quoteSection: (error: string | null) => handleImageErrorChange('quoteSection', error),
            hippoventionCenterSection: (error: string | null) =>
                handleImageErrorChange('hippoventionCenterSection', error),
            advantagesSection: (index: number, error: string | null) =>
                handleImageErrorChange(`advantagesSection-${index}`, error),
            anotherQuoteSection: (error: string | null) => handleImageErrorChange('anotherQuoteSection', error),
            participantsSection: (index: number, error: string | null) =>
                handleImageErrorChange(`participantsSection-${index}`, error),
            ethicsSection: (error: string | null) => handleImageErrorChange('ethicsSection', error),
        }),
        [handleImageErrorChange],
    );

    const handlePublish = useCallback(async () => {
        if (!draftContent) return;

        setIsPublishing(true);
        try {
            const result = await HippotherapyPageApi.update(client, draftContent);
            setFetchedContent(result);
            setDraftContent(result);
            addToast(COMMON_TEXT_ADMIN.MESSAGE.SUCCESSFULLY_PUBLISHED, ToastType.Info);
        } catch {
            addToast(COMMON_TEXT_ADMIN.MESSAGE.FAIL_TO_PUBLISH_CHANGES, ToastType.Error);
        } finally {
            setIsPublishing(false);
            setConfirmationModalOpen(false);
        }
    }, [client, draftContent, addToast]);

    const isDisabled = isPublishing;
    const isNotFound = isNotFoundError(error);

    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="hippotherapy-page-loader">
                    <InlineLoader size={3} />
                </div>
            );
        }

        if (error && !isNotFound) {
            return (
                <div className="hippotherapy-page-error-message">
                    <p>{HIPPOTHERAPY_PAGE_TEXT.FAIL_TO_FETCH}</p>
                    <button onClick={() => refetch()} type="button" className="retry-link">
                        {COMMON_TEXT_ADMIN.BUTTON.TRY_AGAIN}
                    </button>
                </div>
            );
        }

        if (!draftContent) {
            return (
                <div className="hippotherapy-page-loader">
                    <InlineLoader size={3} />
                </div>
            );
        }

        return (
            <div className="hippotherapy-page-sections">
                {isNotFound && (
                    <p className="hippotherapy-page-empty-notice">{HIPPOTHERAPY_PAGE_TEXT.EMPTY_STATE_NOTICE}</p>
                )}
                <IntroBannerSection
                    value={draftContent.introSection}
                    onChange={sectionHandlers.introSection}
                    onImageError={imageErrorHandlers.introSection}
                    disabled={isDisabled}
                />
                <hr />
                <TextCardSection
                    value={draftContent.descriptionSection}
                    onChange={sectionHandlers.descriptionSection}
                    fieldIdPrefix="hippotherapy-description"
                    disabled={isDisabled}
                />
                <hr />
                <HippotherapyQuoteSection
                    value={draftContent.quoteSection}
                    onChange={sectionHandlers.quoteSection}
                    fieldIdPrefix="hippotherapy-quote"
                    defaultImageStyle={HIPPOTHERAPY_PAGE_DEFAULT_IMAGE_STYLES.QUOTE}
                    onImageError={imageErrorHandlers.quoteSection}
                    disabled={isDisabled}
                />
                <hr />
                <TextCardSection
                    value={draftContent.hippoventionSection}
                    onChange={sectionHandlers.hippoventionSection}
                    fieldIdPrefix="hippotherapy-hippovention"
                    disabled={isDisabled}
                />
                <hr />
                <HippoventionCenterSection
                    value={draftContent.hippoventionCenterSection}
                    onChange={sectionHandlers.hippoventionCenterSection}
                    onImageError={imageErrorHandlers.hippoventionCenterSection}
                    disabled={isDisabled}
                />
                <hr />
                <GallerySection
                    value={draftContent.advantagesSection}
                    onChange={sectionHandlers.advantagesSection}
                    fieldIdPrefix="hippotherapy-advantages"
                    defaultCardImageStyles={HIPPOTHERAPY_PAGE_DEFAULT_IMAGE_STYLES.ADVANTAGES_CARDS}
                    onCardImageError={imageErrorHandlers.advantagesSection}
                    disabled={isDisabled}
                />
                <hr />
                <TextCardSection
                    value={draftContent.analysisSection}
                    onChange={sectionHandlers.analysisSection}
                    fieldIdPrefix="hippotherapy-analysis"
                    disabled={isDisabled}
                />
                <hr />
                <ScientificReferencesSection
                    value={draftContent.scientificReferencesSection}
                    onChange={sectionHandlers.scientificReferencesSection}
                    disabled={isDisabled}
                />
                <hr />
                <HippotherapyQuoteSection
                    value={draftContent.anotherQuoteSection}
                    onChange={sectionHandlers.anotherQuoteSection}
                    fieldIdPrefix="hippotherapy-another-quote"
                    defaultImageStyle={HIPPOTHERAPY_PAGE_DEFAULT_IMAGE_STYLES.ANOTHER_QUOTE}
                    onImageError={imageErrorHandlers.anotherQuoteSection}
                    disabled={isDisabled}
                />
                <hr />
                <GallerySection
                    value={draftContent.participantsSection}
                    onChange={sectionHandlers.participantsSection}
                    fieldIdPrefix="hippotherapy-participants"
                    defaultCardImageStyles={HIPPOTHERAPY_PAGE_DEFAULT_IMAGE_STYLES.PARTICIPANTS_CARDS}
                    onCardImageError={imageErrorHandlers.participantsSection}
                    disabled={isDisabled}
                />
                <hr />
                <EthicsSection
                    value={draftContent.ethicsSection}
                    onChange={sectionHandlers.ethicsSection}
                    onImageError={imageErrorHandlers.ethicsSection}
                    disabled={isDisabled}
                />
                <div className="hippotherapy-page-publish">
                    <Button
                        buttonStyle="primary"
                        type="button"
                        onClick={() => setConfirmationModalOpen(true)}
                        disabled={!isPublishButtonActive || !isFormValid || hasImageErrors || isPublishing}
                    >
                        {COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED}
                    </Button>
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="hippotherapy-page-container">{renderContent()}</div>
            <ConfirmationModal
                isOpen={isConfirmationModalOpen}
                onClose={() => setConfirmationModalOpen(false)}
                title={COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES}
                onConfirm={handlePublish}
                onCancel={() => setConfirmationModalOpen(false)}
                isButtonsDisabled={isPublishing}
            />
            <ToastContainer />
        </>
    );
};
