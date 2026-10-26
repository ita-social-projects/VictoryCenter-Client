import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import { HippotherapyPageContent } from './HippotherapyPageContent';
import { HippotherapyPageApi } from '@/services/api/admin/hippotherapy-page/hippotherapy-page-api';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { isHippotherapyPageContentValid } from '@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { HIPPOTHERAPY_PAGE_TEXT } from '@/const/admin/hippotherapy-page';
import { ToastType } from '@/types/admin/toast';
import { HippotherapyPageContentModel, HippotherapyPageLocalizationBlock } from '@/types/admin/hippotherapy-page';
import { useLocalizationToolkit } from '@/hooks/admin/use-localization-toolkit/useLocalizationToolkit';

function mockDisabledAttr(isDisabled: unknown) {
    return String(Boolean(isDisabled));
}

function mockTranslateButton({ onClick, disabled, label }: { onClick?: () => void; disabled?: boolean; label: string }) {
    return onClick ? (
        <button disabled={disabled} onClick={onClick}>
            Translate {label}
        </button>
    ) : null;
}

function mockImageSection(testId: string, label: string, editedTitle: string) {
    return ({ value, onChange, onImageError, disabled, isTranslateDisabled }: any) => (
        <div data-testid={testId} data-translate-disabled={mockDisabledAttr(isTranslateDisabled)}>
            <span>{value.title}</span>
            <button disabled={disabled} onClick={() => onChange({ ...value, title: editedTitle })}>
                Edit {label}
            </button>
            <button onClick={() => onImageError?.('image size error')}>Set {label} image error</button>
            <button onClick={() => onImageError?.(null)}>Clear {label} image error</button>
        </div>
    );
}

jest.mock('@/components/common/inline-loader/InlineLoader', () => ({
    InlineLoader: () => <div data-testid="inline-loader" />,
}));

jest.mock('@/components/admin/toast/toast-container/ToastContainer', () => ({
    ToastContainer: () => <div data-testid="toast-container" />,
}));

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: ({ isOpen, onClose, onConfirm, onCancel, title }: any) =>
        isOpen ? (
            <div data-testid="confirmation-modal">
                <h3>{title}</h3>
                <button onClick={onConfirm}>Confirm</button>
                <button onClick={onCancel}>Cancel</button>
                <button onClick={onClose}>Close</button>
            </div>
        ) : null,
}));

jest.mock('../sections/intro-banner-section/IntroBannerSection', () => ({
    IntroBannerSection: mockImageSection('section-intro', 'intro', 'Edited intro title'),
}));

jest.mock('../sections/hippovention-center-section/HippoventionCenterSection', () => ({
    HippoventionCenterSection: mockImageSection(
        'section-hippovention-center',
        'hippovention center',
        'Edited hippovention center',
    ),
}));

jest.mock('../sections/ethics-section/EthicsSection', () => ({
    EthicsSection: mockImageSection('section-ethics', 'ethics', 'Edited ethics title'),
}));

jest.mock('../sections/text-card-section/TextCardSection', () => ({
    TextCardSection: ({ value, onChange, fieldIdPrefix, disabled, isTranslateDisabled }: any) => (
        <div data-testid={`section-${fieldIdPrefix}`} data-translate-disabled={mockDisabledAttr(isTranslateDisabled)}>
            <span>{value.title}</span>
            <button disabled={disabled} onClick={() => onChange({ ...value, title: 'Edited text card title' })}>
                Edit {fieldIdPrefix}
            </button>
        </div>
    ),
}));

jest.mock('../sections/hippotherapy-quote-section/HippotherapyQuoteSection', () => ({
    HippotherapyQuoteSection: ({
        value,
        onChange,
        onImageError,
        fieldIdPrefix,
        disabled,
        onTranslateClick,
        isTranslateDisabled,
    }: any) => (
        <div data-testid={`section-${fieldIdPrefix}`} data-translate-disabled={mockDisabledAttr(isTranslateDisabled)}>
            <span>{value.quoteText}</span>
            {mockTranslateButton({ onClick: onTranslateClick, disabled: isTranslateDisabled, label: fieldIdPrefix })}
            <button disabled={disabled} onClick={() => onChange({ ...value, quoteText: 'Edited quote' })}>
                Edit {fieldIdPrefix}
            </button>
            <button onClick={() => onImageError?.('image size error')}>Set {fieldIdPrefix} image error</button>
            <button onClick={() => onImageError?.(null)}>Clear {fieldIdPrefix} image error</button>
        </div>
    ),
}));

jest.mock('../sections/gallery-section/GallerySection', () => ({
    GallerySection: ({
        value,
        onChange,
        onCardImageError,
        fieldIdPrefix,
        disabled,
        onTranslateClick,
        isTranslateDisabled,
    }: any) => (
        <div data-testid={`section-${fieldIdPrefix}`} data-translate-disabled={mockDisabledAttr(isTranslateDisabled)}>
            <span>{value.title}</span>
            {mockTranslateButton({ onClick: onTranslateClick, disabled: isTranslateDisabled, label: fieldIdPrefix })}
            <button disabled={disabled} onClick={() => onChange({ ...value, title: 'Edited gallery title' })}>
                Edit {fieldIdPrefix}
            </button>
            <button onClick={() => onCardImageError?.(0, 'image size error')}>
                Set {fieldIdPrefix} card image error
            </button>
            <button onClick={() => onCardImageError?.(0, null)}>Clear {fieldIdPrefix} card image error</button>
        </div>
    ),
}));

jest.mock('../sections/scientific-references-section/ScientificReferencesSection', () => ({
    ScientificReferencesSection: ({
        value,
        onChange,
        disabled,
        onTranslateGeneralClick,
        isTranslateGeneralDisabled,
        onTranslateReferenceClick,
        isTranslateReferenceDisabled,
    }: any) => (
        <div data-testid="section-research" data-translate-disabled={mockDisabledAttr(isTranslateGeneralDisabled)}>
            <span>{value.title}</span>
            <button disabled={disabled} onClick={() => onChange({ ...value, title: 'Edited research title' })}>
                Edit research
            </button>
            <button
                disabled={disabled}
                onClick={() =>
                    onChange({
                        ...value,
                        scientificReferences: [{ ...value.scientificReferences[0], name: 'Edited citation' }],
                    })
                }
            >
                Edit reference item
            </button>
            {mockTranslateButton({
                onClick: onTranslateGeneralClick,
                disabled: isTranslateGeneralDisabled,
                label: 'research-general',
            })}
            {mockTranslateButton({
                onClick: onTranslateReferenceClick && (() => onTranslateReferenceClick('local-1')),
                disabled: isTranslateReferenceDisabled?.('local-1'),
                label: 'research-item',
            })}
        </div>
    ),
}));

jest.mock('../translate-section-modal/TranslateHippotherapySectionModal', () => ({
    TranslateHippotherapySectionModal: ({
        isOpen,
        block,
        subBlock,
        targetResearchLocalId,
        onClose,
        translatedLanguages,
        descriptionImages,
    }: any) =>
        isOpen ? (
            <div data-testid="translate-section-modal">
                <span data-testid="translate-section-modal-block">{block}</span>
                <span data-testid="translate-section-modal-sub-block">{subBlock}</span>
                <span data-testid="translate-section-modal-target-id">{targetResearchLocalId}</span>
                <span data-testid="translate-section-modal-description-images">{descriptionImages.join(',')}</span>
                <span>{translatedLanguages.map((language: any) => language.name).join(',')}</span>
                <button onClick={onClose}>Close translation</button>
            </div>
        ) : null,
}));

jest.mock('@/hooks/admin/use-localization-toolkit/useLocalizationToolkit');
const mockedUseLocalizationToolkit = useLocalizationToolkit as jest.Mock;
const englishLanguage = { id: 2, code: 'en', name: 'Англійська' };

jest.mock('@/services/api/admin/hippotherapy-page/hippotherapy-page-api');
const mockedHippotherapyPageApi = HippotherapyPageApi as jest.Mocked<typeof HippotherapyPageApi>;

jest.mock('@/hooks/admin/use-admin-client/useAdminClient');
const mockedUseAdminClient = useAdminClient as jest.Mock;

jest.mock('@/contexts/admin/toast-context-provider/ToastContextProvider');
const mockedUseToast = useToast as jest.Mock;

jest.mock('@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema', () => ({
    isHippotherapyPageContentValid: jest.fn(() => true),
}));
const mockedIsContentValid = isHippotherapyPageContentValid as jest.Mock;

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const savedImage = { id: 1, url: 'https://example.com/image.webp', mimeType: 'image/webp' };

const buildContent = (): HippotherapyPageContentModel => ({
    localizations: [],
    translationStatuses: [],
    introSection: { title: 'Intro title', description: 'Intro description', image: null, imageId: null },
    descriptionSection: { title: 'Description title', description: 'Description text' },
    quoteSection: { quoteText: 'Quote text', authorName: 'Author', image: savedImage, imageId: savedImage.id },
    hippoventionSection: { title: 'Hippovention title', description: 'Hippovention text' },
    hippoventionCenterSection: {
        title: 'Hippovention center title',
        description: 'Hippovention center text',
        pros: 'Pro one and pro two',
        image: savedImage,
        imageId: savedImage.id,
    },
    advantagesSection: {
        title: 'Advantages title',
        cards: [{ description: 'Card description', image: savedImage, imageId: savedImage.id }],
    },
    analysisSection: { title: 'Analysis title', description: 'Analysis text' },
    scientificReferencesSection: {
        title: 'Research title',
        description: 'Research text',
        scientificReferences: [{ localId: 'local-1', id: 1, name: 'Citation', url: 'https://example.com/citation' }],
    },
    anotherQuoteSection: {
        quoteText: 'Another quote',
        authorName: 'Another author',
        image: savedImage,
        imageId: savedImage.id,
    },
    participantsSection: {
        title: 'Participants title',
        cards: [{ description: 'Participant description', image: savedImage, imageId: savedImage.id }],
    },
    ethicsSection: {
        title: 'Ethics title',
        description: 'Ethics text',
        principles: ['Principle one'],
        image: savedImage,
        imageId: savedImage.id,
    },
});

const withEnglishLocalization = (localization: Record<string, unknown>): HippotherapyPageContentModel => ({
    ...buildContent(),
    localizations: [
        { language: { id: 2, code: 'en' }, translationStatus: 1, ...localization } as any,
    ],
});

const SECTION_TEST_IDS = [
    'section-intro',
    'section-hippotherapy-description',
    'section-hippotherapy-quote',
    'section-hippotherapy-hippovention',
    'section-hippovention-center',
    'section-hippotherapy-advantages',
    'section-hippotherapy-analysis',
    'section-research',
    'section-hippotherapy-another-quote',
    'section-hippotherapy-participants',
    'section-ethics',
];

const PUBLISH_LABEL = COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED;

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const mockClient = { get: jest.fn(), put: jest.fn() };
const mockAddToast = jest.fn();

const getButton = (name: string | RegExp) => screen.getByRole('button', { name });
const clickButton = (name: string | RegExp) => fireEvent.click(getButton(name));
const publishButton = () => getButton(PUBLISH_LABEL);
const translateButton = (fieldIdPrefix: string) => getButton(`Translate ${fieldIdPrefix}`);

const expectTranslationDisabledFor = (testIds: string[], isDisabled: boolean) =>
    testIds.forEach((testId) =>
        expect(screen.getByTestId(testId)).toHaveAttribute('data-translate-disabled', String(isDisabled)),
    );

const expectTranslationDisabledForEverySection = (isDisabled: boolean) =>
    expectTranslationDisabledFor(SECTION_TEST_IDS, isDisabled);

const expectTranslationDisabledForEveryOtherSection = (isDisabled: boolean) =>
    expectTranslationDisabledFor(
        SECTION_TEST_IDS.filter((testId) => testId !== 'section-hippotherapy-advantages'),
        isDisabled,
    );

const renderLoaded = async (content: HippotherapyPageContentModel = buildContent()) => {
    mockedHippotherapyPageApi.get.mockResolvedValue(content);
    render(<HippotherapyPageContent />);
    await screen.findByTestId('section-intro');
};

const mockPageNotFound = () => {
    jest.spyOn(axios, 'isAxiosError').mockImplementation((error: unknown) => Boolean((error as any)?.response));
    mockedHippotherapyPageApi.get.mockRejectedValue({ response: { status: 404 } });
};

const editIntro = () => clickButton('Edit intro');

const publishChanges = () => {
    clickButton(PUBLISH_LABEL);
    clickButton('Confirm');
};

const editIntroAndPublish = () => {
    editIntro();
    publishChanges();
};

const expectToast = (message: string, type: ToastType) =>
    waitFor(() => expect(mockAddToast).toHaveBeenCalledWith(message, type));

const expectUpdateCalledWith = (partial: Record<string, unknown>) =>
    expect(mockedHippotherapyPageApi.update).toHaveBeenCalledWith(mockClient, expect.objectContaining(partial));

const expectTranslationModalBlock = (block: unknown) =>
    expect(screen.getByTestId('translate-section-modal-block')).toHaveTextContent(String(block));

const closeTranslationModal = () => {
    clickButton('Close translation');
    expect(screen.queryByTestId('translate-section-modal')).not.toBeInTheDocument();
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('HippotherapyPageContent', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedUseAdminClient.mockReturnValue(mockClient);
        mockedUseToast.mockReturnValue({ addToast: mockAddToast });
        mockedIsContentValid.mockReturnValue(true);
        mockedUseLocalizationToolkit.mockReturnValue({ translationLanguages: [englishLanguage] });

        if (!(global as any).crypto) {
            Object.defineProperty(global, 'crypto', { value: {}, configurable: true, writable: true });
        }
        (global as any).crypto.randomUUID = jest.fn(() => 'generated-uuid');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('shows a loader while fetching', () => {
        mockedHippotherapyPageApi.get.mockReturnValue(new Promise(() => {}));

        render(<HippotherapyPageContent />);

        expect(screen.getByTestId('inline-loader')).toBeInTheDocument();
    });

    it('shows an error state with a retry action when the fetch fails', async () => {
        mockedHippotherapyPageApi.get.mockRejectedValue(new Error('network error'));

        render(<HippotherapyPageContent />);

        expect(await screen.findByText(HIPPOTHERAPY_PAGE_TEXT.FAIL_TO_FETCH)).toBeInTheDocument();

        mockedHippotherapyPageApi.get.mockResolvedValue(buildContent());
        clickButton(COMMON_TEXT_ADMIN.BUTTON.TRY_AGAIN);

        expect(await screen.findByTestId('section-intro')).toBeInTheDocument();
        expect(mockedHippotherapyPageApi.get).toHaveBeenCalledTimes(2);
    });

    it('falls back to a blank, editable form with an empty-state notice when the page has not been created yet (404)', async () => {
        mockPageNotFound();

        render(<HippotherapyPageContent />);

        expect(await screen.findByText(HIPPOTHERAPY_PAGE_TEXT.EMPTY_STATE_NOTICE)).toBeInTheDocument();
        expect(screen.queryByText(HIPPOTHERAPY_PAGE_TEXT.FAIL_TO_FETCH)).not.toBeInTheDocument();
        expect(screen.getByTestId('section-intro')).toBeInTheDocument();
        expect(publishButton()).toBeDisabled();
        expectTranslationDisabledForEverySection(true);
    });

    it('lets the admin fill in and publish a page that did not exist yet, enabling translation afterwards', async () => {
        mockPageNotFound();
        const created = { ...buildContent(), introSection: { ...buildContent().introSection, title: 'Created title' } };
        mockedHippotherapyPageApi.update.mockResolvedValue(created);

        render(<HippotherapyPageContent />);

        await screen.findByText(HIPPOTHERAPY_PAGE_TEXT.EMPTY_STATE_NOTICE);
        editIntroAndPublish();

        await expectToast(COMMON_TEXT_ADMIN.MESSAGE.UPDATES_SUCCESSFULLY_PUBLISHED, ToastType.Info);
        expectUpdateCalledWith({ introSection: expect.objectContaining({ title: 'Edited intro title' }) });
        expectTranslationDisabledForEverySection(false);
    });

    it('renders every section once loaded and keeps the publish button disabled until something changes', async () => {
        await renderLoaded();

        SECTION_TEST_IDS.forEach((testId) => expect(screen.getByTestId(testId)).toBeInTheDocument());

        expect(publishButton()).toBeDisabled();
    });

    it('enables the publish button once a section is edited', async () => {
        await renderLoaded();

        editIntro();

        expect(publishButton()).toBeEnabled();
    });

    it('disables the publish button while a section reports an image error, even if the content is otherwise valid and dirty', async () => {
        await renderLoaded();

        editIntro();
        expect(publishButton()).toBeEnabled();

        clickButton('Set hippotherapy-quote image error');
        expect(publishButton()).toBeDisabled();

        clickButton('Clear hippotherapy-quote image error');
        expect(publishButton()).toBeEnabled();
    });

    it('keeps the publish button enabled when an image error comes from an empty slot', async () => {
        const content = buildContent();
        content.introSection = { ...content.introSection, image: null, imageId: null };
        await renderLoaded(content);

        editIntro();
        clickButton('Set intro image error');

        expect(publishButton()).toBeEnabled();
    });

    it('keeps the publish button disabled when the content is invalid', async () => {
        mockedIsContentValid.mockReturnValue(false);
        await renderLoaded();

        editIntro();

        expect(publishButton()).toBeDisabled();
    });

    it('publishes changes, shows a success toast, resets the dirty state, and enables translation again on confirm', async () => {
        const content = buildContent();
        const publishedContent = { ...content, introSection: { ...content.introSection, title: 'Edited intro title' } };
        mockedHippotherapyPageApi.update.mockResolvedValue(publishedContent);
        await renderLoaded(content);

        editIntro();
        clickButton(PUBLISH_LABEL);

        expect(screen.getByText(COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES)).toBeInTheDocument();

        clickButton('Confirm');

        await expectToast(COMMON_TEXT_ADMIN.MESSAGE.UPDATES_SUCCESSFULLY_PUBLISHED, ToastType.Info);
        expect(screen.queryByText(COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES)).not.toBeInTheDocument();
        expectUpdateCalledWith({ introSection: expect.objectContaining({ title: 'Edited intro title' }) });
        expect(publishButton()).toBeDisabled();
        expectTranslationDisabledForEverySection(false);
    });

    it('shows a failure toast and keeps published Advantages translation available when publishing fails elsewhere', async () => {
        mockedHippotherapyPageApi.update.mockRejectedValue(new Error('publish failed'));
        await renderLoaded();

        editIntroAndPublish();

        await expectToast(COMMON_TEXT_ADMIN.MESSAGE.FAIL_TO_PUBLISH_CHANGES, ToastType.Error);
        expectTranslationDisabledForEveryOtherSection(true);
        expect(translateButton('hippotherapy-advantages')).toBeEnabled();
    });

    it('updates every non-intro section when its edit control is used', async () => {
        mockedHippotherapyPageApi.update.mockResolvedValue(buildContent());
        await renderLoaded();

        [
            'Edit hippotherapy-description',
            'Edit hippotherapy-quote',
            'Edit hippotherapy-hippovention',
            'Edit hippovention center',
            'Edit hippotherapy-advantages',
            'Edit hippotherapy-analysis',
            'Edit research',
            'Edit hippotherapy-another-quote',
            'Edit hippotherapy-participants',
            'Edit ethics',
        ].forEach(clickButton);

        expect(publishButton()).toBeEnabled();

        publishChanges();

        await waitFor(() => expect(mockedHippotherapyPageApi.update).toHaveBeenCalled());
        expectUpdateCalledWith({
            descriptionSection: expect.objectContaining({ title: 'Edited text card title' }),
            quoteSection: expect.objectContaining({ quoteText: 'Edited quote' }),
            hippoventionSection: expect.objectContaining({ title: 'Edited text card title' }),
            hippoventionCenterSection: expect.objectContaining({ title: 'Edited hippovention center' }),
            advantagesSection: expect.objectContaining({ title: 'Edited gallery title' }),
            analysisSection: expect.objectContaining({ title: 'Edited text card title' }),
            scientificReferencesSection: expect.objectContaining({ title: 'Edited research title' }),
            anotherQuoteSection: expect.objectContaining({ quoteText: 'Edited quote' }),
            participantsSection: expect.objectContaining({ title: 'Edited gallery title' }),
            ethicsSection: expect.objectContaining({ title: 'Edited ethics title' }),
        });
    });

    it('disables the publish button when any non-intro section reports an image error', async () => {
        await renderLoaded();

        editIntro();
        expect(publishButton()).toBeEnabled();

        [
            'hippotherapy-quote',
            'hippovention center',
            'hippotherapy-advantages card',
            'hippotherapy-another-quote',
            'hippotherapy-participants card',
            'ethics',
        ].forEach((section) => {
            clickButton(`Set ${section} image error`);
            expect(publishButton()).toBeDisabled();

            clickButton(`Clear ${section} image error`);
        });

        expect(publishButton()).toBeEnabled();
    });

    it('closes the confirmation modal without publishing when cancel or close is triggered', async () => {
        await renderLoaded();

        editIntro();

        ['Cancel', 'Close'].forEach((closeAction) => {
            clickButton(PUBLISH_LABEL);
            expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();

            clickButton(closeAction);
            expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
            expect(mockedHippotherapyPageApi.update).not.toHaveBeenCalled();
        });
    });

    it('keeps translation enabled for every section while there are no unpublished changes', async () => {
        await renderLoaded();

        expectTranslationDisabledForEverySection(false);
    });

    it('disables other translations but keeps published Advantages available when another section has unpublished changes', async () => {
        await renderLoaded();

        clickButton('Edit ethics');

        expectTranslationDisabledForEveryOtherSection(true);
        expect(translateButton('hippotherapy-advantages')).toBeEnabled();
    });

    describe('review section translation', () => {
        it('opens the Advantages translation modal with the four source images', async () => {
            await renderLoaded();

            clickButton('Translate hippotherapy-advantages');

            expectTranslationModalBlock(HippotherapyPageLocalizationBlock.Advantages);
            const imageSources = screen
                .getByTestId('translate-section-modal-description-images')
                .textContent?.split(',');
            expect(imageSources).toHaveLength(4);
            expect(imageSources?.[0]).toBe('https://example.com/image.webp');
            expect(imageSources?.every(Boolean)).toBe(true);
        });

        it('disables the Advantages translation icon when an English translation exists', async () => {
            await renderLoaded(
                withEnglishLocalization({ advantagesSection: { title: 'English title', cards: [] } }),
            );

            expect(translateButton('hippotherapy-advantages')).toBeDisabled();
        });

        it('keeps the Advantages translation icon enabled when English fields contain only empty rich text', async () => {
            await renderLoaded(
                withEnglishLocalization({
                    advantagesSection: {
                        title: '<p><br></p>',
                        cards: [{ description: '<p><br></p>' }],
                    },
                }),
            );

            expect(translateButton('hippotherapy-advantages')).toBeEnabled();
        });

        it('keeps Advantages translation enabled when an unrelated section has unpublished changes', async () => {
            await renderLoaded();

            clickButton('Edit ethics');

            expect(translateButton('hippotherapy-advantages')).toBeEnabled();
        });

        it('disables Advantages translation when that section has unpublished changes', async () => {
            await renderLoaded();

            const advantagesTranslateButton = translateButton('hippotherapy-advantages');
            clickButton('Edit hippotherapy-advantages');

            expect(advantagesTranslateButton).toBeDisabled();
        });

        it.each([
            ['hippotherapy-quote', HippotherapyPageLocalizationBlock.Quote],
            ['hippotherapy-another-quote', HippotherapyPageLocalizationBlock.AnotherQuote],
        ])('opens the translation modal scoped to the %s section', async (fieldIdPrefix, block) => {
            await renderLoaded();

            clickButton(`Translate ${fieldIdPrefix}`);

            expectTranslationModalBlock(block);
            expect(screen.getByText(englishLanguage.name)).toBeInTheDocument();

            closeTranslationModal();
        });

        it('disables the translation icons of both review sections when another section has unpublished changes', async () => {
            await renderLoaded();

            const quoteTranslateButton = translateButton('hippotherapy-quote');
            const anotherQuoteTranslateButton = translateButton('hippotherapy-another-quote');
            expect(quoteTranslateButton).toBeEnabled();
            expect(anotherQuoteTranslateButton).toBeEnabled();

            editIntro();

            expect(quoteTranslateButton).toBeDisabled();
            expect(anotherQuoteTranslateButton).toBeDisabled();
        });

        it.each([
            ['hippotherapy-quote', 'quoteSection', 'hippotherapy-another-quote'],
            ['hippotherapy-another-quote', 'anotherQuoteSection', 'hippotherapy-quote'],
        ])(
            'disables the %s translation icon when an English translation already exists',
            async (fieldIdPrefix, sectionKey, otherFieldIdPrefix) => {
                await renderLoaded(
                    withEnglishLocalization({
                        [sectionKey]: { quoteText: 'English quote', authorName: 'English author' },
                    }),
                );

                expect(translateButton(fieldIdPrefix)).toBeDisabled();
                expect(translateButton(otherFieldIdPrefix)).toBeEnabled();
            },
        );

        it.each(['hippotherapy-quote', 'hippotherapy-advantages'])(
            'keeps the %s translation icon disabled while the page is being published',
            async (fieldIdPrefix) => {
                mockedHippotherapyPageApi.update.mockReturnValue(new Promise(() => {}));
                await renderLoaded();

                editIntroAndPublish();

                await waitFor(() => expect(translateButton(fieldIdPrefix)).toBeDisabled());
            },
        );

        it('hides the translation icons while no translation languages are available', async () => {
            mockedUseLocalizationToolkit.mockReturnValue({ translationLanguages: [] });
            await renderLoaded();

            expect(screen.queryByRole('button', { name: /^Translate / })).not.toBeInTheDocument();
        });

        it('disables the translation icons when the page has not been created yet', async () => {
            mockPageNotFound();

            render(<HippotherapyPageContent />);

            expect(await screen.findByRole('button', { name: 'Translate hippotherapy-quote' })).toBeDisabled();
            expect(translateButton('hippotherapy-another-quote')).toBeDisabled();
            expect(translateButton('hippotherapy-advantages')).toBeDisabled();
        });

        it('shows an error toast when the translation languages fail to load', async () => {
            await renderLoaded();

            const { setErrorState } = mockedUseLocalizationToolkit.mock.calls[0][0];
            setErrorState(COMMON_TEXT_ADMIN.LOCALIZATION.LANGUAGES.MESSAGE.FAILED_TO_FETCH_LANGUAGES, 'languages');

            expect(mockAddToast).toHaveBeenCalledWith(
                COMMON_TEXT_ADMIN.LOCALIZATION.LANGUAGES.MESSAGE.FAILED_TO_FETCH_LANGUAGES,
                ToastType.Error,
            );
        });
    });

    describe('scientific references section translation', () => {
        it.each([
            ['general block', 'Translate research-general', 'Edit research', 'general', undefined],
            ['specific reference item', 'Translate research-item', 'Edit reference item', 'research', 'local-1'],
        ])(
            'opens the translation modal for the %s and disables when edited',
            async (_title, translateName, editName, expectedSubBlock, expectedTargetId) => {
                await renderLoaded();

                const translateAction = getButton(translateName);
                expect(translateAction).toBeEnabled();

                fireEvent.click(translateAction);

                expectTranslationModalBlock(HippotherapyPageLocalizationBlock.ScientificReferences);
                expect(screen.getByTestId('translate-section-modal-sub-block')).toHaveTextContent(expectedSubBlock);
                if (expectedTargetId) {
                    expect(screen.getByTestId('translate-section-modal-target-id')).toHaveTextContent(
                        expectedTargetId,
                    );
                }

                closeTranslationModal();

                clickButton(editName);
                expect(translateAction).toBeDisabled();
            },
        );

        it.each([
            [
                'general research',
                'Translate research-general',
                {
                    title: 'English Title',
                    description: 'English Description',
                    scientificReferences: [],
                },
            ],
            [
                'research reference item',
                'Translate research-item',
                {
                    title: '',
                    description: '',
                    scientificReferences: [{ id: 1, name: 'Translated citation' }],
                },
            ],
        ])(
            'disables the %s translation action when an English translation already exists',
            async (_title, translateName, scientificReferencesSection) => {
                await renderLoaded(withEnglishLocalization({ scientificReferencesSection }));

                expect(getButton(translateName)).toBeDisabled();
            },
        );
    });
});
