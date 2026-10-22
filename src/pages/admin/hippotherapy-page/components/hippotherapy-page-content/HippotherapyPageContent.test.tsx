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
    IntroBannerSection: ({ value, onChange, onImageError, disabled, isTranslateDisabled, onTranslateClick }: any) => (
        <div data-testid="section-intro" data-translate-disabled={String(Boolean(isTranslateDisabled))}>
            <span>{value.title}</span>
            {onTranslateClick && (
                <button disabled={isTranslateDisabled} onClick={onTranslateClick}>
                    Translate intro
                </button>
            )}
            <button disabled={disabled} onClick={() => onChange({ ...value, title: 'Edited intro title' })}>
                Edit intro
            </button>
            <button onClick={() => onImageError?.('image size error')}>Set intro image error</button>
            <button onClick={() => onImageError?.(null)}>Clear intro image error</button>
        </div>
    ),
}));

jest.mock('../sections/text-card-section/TextCardSection', () => ({
    TextCardSection: ({ value, onChange, fieldIdPrefix, disabled, isTranslateDisabled, onTranslateClick }: any) => (
        <div data-testid={`section-${fieldIdPrefix}`} data-translate-disabled={String(Boolean(isTranslateDisabled))}>
            <span>{value.title}</span>
            {onTranslateClick && (
                <button disabled={isTranslateDisabled} onClick={onTranslateClick}>
                    Translate {fieldIdPrefix}
                </button>
            )}
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
        <div data-testid={`section-${fieldIdPrefix}`} data-translate-disabled={String(Boolean(isTranslateDisabled))}>
            <span>{value.quoteText}</span>
            {onTranslateClick && (
                <button disabled={isTranslateDisabled} onClick={onTranslateClick}>
                    Translate {fieldIdPrefix}
                </button>
            )}
            <button disabled={disabled} onClick={() => onChange({ ...value, quoteText: 'Edited quote' })}>
                Edit {fieldIdPrefix}
            </button>
            <button onClick={() => onImageError?.('image size error')}>Set {fieldIdPrefix} image error</button>
            <button onClick={() => onImageError?.(null)}>Clear {fieldIdPrefix} image error</button>
        </div>
    ),
}));

jest.mock('../sections/hippovention-center-section/HippoventionCenterSection', () => ({
    HippoventionCenterSection: ({ value, onChange, onImageError, disabled, isTranslateDisabled }: any) => (
        <div data-testid="section-hippovention-center" data-translate-disabled={String(Boolean(isTranslateDisabled))}>
            <span>{value.title}</span>
            <button disabled={disabled} onClick={() => onChange({ ...value, title: 'Edited hippovention center' })}>
                Edit hippovention center
            </button>
            <button onClick={() => onImageError?.('image size error')}>Set hippovention center image error</button>
            <button onClick={() => onImageError?.(null)}>Clear hippovention center image error</button>
        </div>
    ),
}));

jest.mock('../sections/gallery-section/GallerySection', () => ({
    GallerySection: ({ value, onChange, onCardImageError, fieldIdPrefix, disabled, isTranslateDisabled }: any) => (
        <div data-testid={`section-${fieldIdPrefix}`} data-translate-disabled={String(Boolean(isTranslateDisabled))}>
            <span>{value.title}</span>
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
    ScientificReferencesSection: ({ value, onChange, disabled, isTranslateDisabled }: any) => (
        <div data-testid="section-research" data-translate-disabled={String(Boolean(isTranslateDisabled))}>
            <span>{value.title}</span>
            <button disabled={disabled} onClick={() => onChange({ ...value, title: 'Edited research title' })}>
                Edit research
            </button>
        </div>
    ),
}));

jest.mock('../sections/ethics-section/EthicsSection', () => ({
    EthicsSection: ({ value, onChange, onImageError, disabled, isTranslateDisabled }: any) => (
        <div data-testid="section-ethics" data-translate-disabled={String(Boolean(isTranslateDisabled))}>
            <span>{value.title}</span>
            <button disabled={disabled} onClick={() => onChange({ ...value, title: 'Edited ethics title' })}>
                Edit ethics
            </button>
            <button onClick={() => onImageError?.('image size error')}>Set ethics image error</button>
            <button onClick={() => onImageError?.(null)}>Clear ethics image error</button>
        </div>
    ),
}));

jest.mock('../translate-section-modal/TranslateHippotherapySectionModal', () => ({
    TranslateHippotherapySectionModal: ({ isOpen, block, onClose, translatedLanguages }: any) =>
        isOpen ? (
            <div data-testid="translate-section-modal">
                <span data-testid="translate-section-modal-block">{block}</span>
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

const expectTranslationDisabledForEverySection = (isDisabled: boolean) => {
    SECTION_TEST_IDS.forEach((testId) =>
        expect(screen.getByTestId(testId)).toHaveAttribute('data-translate-disabled', String(isDisabled)),
    );
};

describe('HippotherapyPageContent', () => {
    const mockClient = { get: jest.fn(), put: jest.fn() };
    const mockAddToast = jest.fn();

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
        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.TRY_AGAIN }));

        expect(await screen.findByTestId('section-intro')).toBeInTheDocument();
        expect(mockedHippotherapyPageApi.get).toHaveBeenCalledTimes(2);
    });

    it('falls back to a blank, editable form with an empty-state notice when the page has not been created yet (404)', async () => {
        jest.spyOn(axios, 'isAxiosError').mockImplementation((error: unknown) => Boolean((error as any)?.response));
        mockedHippotherapyPageApi.get.mockRejectedValue({ response: { status: 404 } });

        render(<HippotherapyPageContent />);

        expect(await screen.findByText(HIPPOTHERAPY_PAGE_TEXT.EMPTY_STATE_NOTICE)).toBeInTheDocument();
        expect(screen.queryByText(HIPPOTHERAPY_PAGE_TEXT.FAIL_TO_FETCH)).not.toBeInTheDocument();
        expect(screen.getByTestId('section-intro')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeDisabled();
        expectTranslationDisabledForEverySection(true);
    });

    it('lets the admin fill in and publish a page that did not exist yet, enabling translation afterwards', async () => {
        jest.spyOn(axios, 'isAxiosError').mockImplementation((error: unknown) => Boolean((error as any)?.response));
        mockedHippotherapyPageApi.get.mockRejectedValue({ response: { status: 404 } });
        const created = { ...buildContent(), introSection: { ...buildContent().introSection, title: 'Created title' } };
        mockedHippotherapyPageApi.update.mockResolvedValue(created);

        render(<HippotherapyPageContent />);

        await screen.findByText(HIPPOTHERAPY_PAGE_TEXT.EMPTY_STATE_NOTICE);
        fireEvent.click(screen.getByRole('button', { name: 'Edit intro' }));
        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED }));
        fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

        await waitFor(() =>
            expect(mockAddToast).toHaveBeenCalledWith(
                COMMON_TEXT_ADMIN.MESSAGE.UPDATES_SUCCESSFULLY_PUBLISHED,
                ToastType.Info,
            ),
        );
        expect(mockedHippotherapyPageApi.update).toHaveBeenCalledWith(
            mockClient,
            expect.objectContaining({ introSection: expect.objectContaining({ title: 'Edited intro title' }) }),
        );
        expectTranslationDisabledForEverySection(false);
    });

    it('renders every section once loaded and keeps the publish button disabled until something changes', async () => {
        mockedHippotherapyPageApi.get.mockResolvedValue(buildContent());

        render(<HippotherapyPageContent />);

        expect(await screen.findByTestId('section-intro')).toBeInTheDocument();
        expect(screen.getByTestId('section-hippotherapy-description')).toBeInTheDocument();
        expect(screen.getByTestId('section-hippotherapy-quote')).toBeInTheDocument();
        expect(screen.getByTestId('section-hippotherapy-hippovention')).toBeInTheDocument();
        expect(screen.getByTestId('section-hippovention-center')).toBeInTheDocument();
        expect(screen.getByTestId('section-hippotherapy-advantages')).toBeInTheDocument();
        expect(screen.getByTestId('section-hippotherapy-analysis')).toBeInTheDocument();
        expect(screen.getByTestId('section-research')).toBeInTheDocument();
        expect(screen.getByTestId('section-hippotherapy-another-quote')).toBeInTheDocument();
        expect(screen.getByTestId('section-hippotherapy-participants')).toBeInTheDocument();
        expect(screen.getByTestId('section-ethics')).toBeInTheDocument();

        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeDisabled();
    });

    it('enables the publish button once a section is edited', async () => {
        mockedHippotherapyPageApi.get.mockResolvedValue(buildContent());

        render(<HippotherapyPageContent />);

        await screen.findByTestId('section-intro');
        fireEvent.click(screen.getByRole('button', { name: 'Edit intro' }));

        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeEnabled();
    });

    it('disables the publish button while a section reports an image error, even if the content is otherwise valid and dirty', async () => {
        mockedHippotherapyPageApi.get.mockResolvedValue(buildContent());

        render(<HippotherapyPageContent />);

        await screen.findByTestId('section-intro');
        fireEvent.click(screen.getByRole('button', { name: 'Edit intro' }));
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeEnabled();

        fireEvent.click(screen.getByRole('button', { name: 'Set hippotherapy-quote image error' }));
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeDisabled();

        fireEvent.click(screen.getByRole('button', { name: 'Clear hippotherapy-quote image error' }));
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeEnabled();
    });

    it('keeps the publish button enabled when an image error comes from an empty slot', async () => {
        const content = buildContent();
        content.introSection = { ...content.introSection, image: null, imageId: null };
        mockedHippotherapyPageApi.get.mockResolvedValue(content);

        render(<HippotherapyPageContent />);

        await screen.findByTestId('section-intro');
        fireEvent.click(screen.getByRole('button', { name: 'Edit intro' }));
        fireEvent.click(screen.getByRole('button', { name: 'Set intro image error' }));

        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeEnabled();
    });

    it('keeps the publish button disabled when the content is invalid', async () => {
        mockedHippotherapyPageApi.get.mockResolvedValue(buildContent());
        mockedIsContentValid.mockReturnValue(false);

        render(<HippotherapyPageContent />);

        await screen.findByTestId('section-intro');
        fireEvent.click(screen.getByRole('button', { name: 'Edit intro' }));

        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeDisabled();
    });

    it('publishes changes, shows a success toast, resets the dirty state, and enables translation again on confirm', async () => {
        const content = buildContent();
        mockedHippotherapyPageApi.get.mockResolvedValue(content);
        const publishedContent = { ...content, introSection: { ...content.introSection, title: 'Edited intro title' } };
        mockedHippotherapyPageApi.update.mockResolvedValue(publishedContent);

        render(<HippotherapyPageContent />);

        await screen.findByTestId('section-intro');
        fireEvent.click(screen.getByRole('button', { name: 'Edit intro' }));
        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED }));

        expect(screen.getByText(COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES)).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

        await waitFor(() =>
            expect(mockAddToast).toHaveBeenCalledWith(
                COMMON_TEXT_ADMIN.MESSAGE.UPDATES_SUCCESSFULLY_PUBLISHED,
                ToastType.Info,
            ),
        );
        expect(screen.queryByText(COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES)).not.toBeInTheDocument();
        expect(mockedHippotherapyPageApi.update).toHaveBeenCalledWith(
            mockClient,
            expect.objectContaining({ introSection: expect.objectContaining({ title: 'Edited intro title' }) }),
        );
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeDisabled();
        expectTranslationDisabledForEverySection(false);
    });

    it('shows a failure toast and keeps translation disabled when publishing fails', async () => {
        mockedHippotherapyPageApi.get.mockResolvedValue(buildContent());
        mockedHippotherapyPageApi.update.mockRejectedValue(new Error('publish failed'));

        render(<HippotherapyPageContent />);

        await screen.findByTestId('section-intro');
        fireEvent.click(screen.getByRole('button', { name: 'Edit intro' }));
        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED }));
        fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

        await waitFor(() =>
            expect(mockAddToast).toHaveBeenCalledWith(
                COMMON_TEXT_ADMIN.MESSAGE.FAIL_TO_PUBLISH_CHANGES,
                ToastType.Error,
            ),
        );
        expectTranslationDisabledForEverySection(true);
    });

    it('updates every non-intro section when its edit control is used', async () => {
        mockedHippotherapyPageApi.get.mockResolvedValue(buildContent());
        mockedHippotherapyPageApi.update.mockResolvedValue(buildContent());

        render(<HippotherapyPageContent />);

        await screen.findByTestId('section-intro');

        fireEvent.click(screen.getByRole('button', { name: 'Edit hippotherapy-description' }));
        fireEvent.click(screen.getByRole('button', { name: 'Edit hippotherapy-quote' }));
        fireEvent.click(screen.getByRole('button', { name: 'Edit hippotherapy-hippovention' }));
        fireEvent.click(screen.getByRole('button', { name: 'Edit hippovention center' }));
        fireEvent.click(screen.getByRole('button', { name: 'Edit hippotherapy-advantages' }));
        fireEvent.click(screen.getByRole('button', { name: 'Edit hippotherapy-analysis' }));
        fireEvent.click(screen.getByRole('button', { name: 'Edit research' }));
        fireEvent.click(screen.getByRole('button', { name: 'Edit hippotherapy-another-quote' }));
        fireEvent.click(screen.getByRole('button', { name: 'Edit hippotherapy-participants' }));
        fireEvent.click(screen.getByRole('button', { name: 'Edit ethics' }));

        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeEnabled();

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED }));
        fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

        await waitFor(() => expect(mockedHippotherapyPageApi.update).toHaveBeenCalled());
        expect(mockedHippotherapyPageApi.update).toHaveBeenCalledWith(
            mockClient,
            expect.objectContaining({
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
            }),
        );
    });

    it('disables the publish button when any non-intro section reports an image error', async () => {
        mockedHippotherapyPageApi.get.mockResolvedValue(buildContent());

        render(<HippotherapyPageContent />);

        await screen.findByTestId('section-intro');
        fireEvent.click(screen.getByRole('button', { name: 'Edit intro' }));
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeEnabled();

        const sections = [
            'hippotherapy-quote',
            'hippovention center',
            'hippotherapy-advantages card',
            'hippotherapy-another-quote',
            'hippotherapy-participants card',
            'ethics',
        ];

        sections.forEach((section) => {
            fireEvent.click(screen.getByRole('button', { name: `Set ${section} image error` }));
            expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeDisabled();

            fireEvent.click(screen.getByRole('button', { name: `Clear ${section} image error` }));
        });

        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeEnabled();
    });

    it('closes the confirmation modal without publishing when cancel or close is triggered', async () => {
        mockedHippotherapyPageApi.get.mockResolvedValue(buildContent());

        render(<HippotherapyPageContent />);

        await screen.findByTestId('section-intro');
        fireEvent.click(screen.getByRole('button', { name: 'Edit intro' }));
        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED }));
        expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
        expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
        expect(mockedHippotherapyPageApi.update).not.toHaveBeenCalled();

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED }));
        expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Close' }));
        expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
        expect(mockedHippotherapyPageApi.update).not.toHaveBeenCalled();
    });

    it('keeps translation enabled for every section while there are no unpublished changes', async () => {
        mockedHippotherapyPageApi.get.mockResolvedValue(buildContent());

        render(<HippotherapyPageContent />);

        await screen.findByTestId('section-intro');
        expectTranslationDisabledForEverySection(false);
    });

    it('disables translation for every section once any section has unpublished changes', async () => {
        mockedHippotherapyPageApi.get.mockResolvedValue(buildContent());

        render(<HippotherapyPageContent />);

        await screen.findByTestId('section-intro');
        fireEvent.click(screen.getByRole('button', { name: 'Edit ethics' }));

        expectTranslationDisabledForEverySection(true);
    });

    describe('section translation', () => {
        it.each([
            ['intro', HippotherapyPageLocalizationBlock.Intro],
            ['hippotherapy-description', HippotherapyPageLocalizationBlock.Description],
            ['hippotherapy-quote', HippotherapyPageLocalizationBlock.Quote],
            ['hippotherapy-hippovention', HippotherapyPageLocalizationBlock.Hippovention],
            ['hippotherapy-analysis', HippotherapyPageLocalizationBlock.Analysis],
            ['hippotherapy-another-quote', HippotherapyPageLocalizationBlock.AnotherQuote],
        ])('opens the translation modal scoped to the %s section', async (fieldIdPrefix, block) => {
            mockedHippotherapyPageApi.get.mockResolvedValue(buildContent());

            render(<HippotherapyPageContent />);

            fireEvent.click(await screen.findByRole('button', { name: `Translate ${fieldIdPrefix}` }));

            expect(screen.getByTestId('translate-section-modal-block')).toHaveTextContent(String(block));
            expect(screen.getByText(englishLanguage.name)).toBeInTheDocument();

            fireEvent.click(screen.getByRole('button', { name: 'Close translation' }));
            expect(screen.queryByTestId('translate-section-modal')).not.toBeInTheDocument();
        });

        it('disables the translation icons when another section has unpublished changes', async () => {
            mockedHippotherapyPageApi.get.mockResolvedValue(buildContent());

            render(<HippotherapyPageContent />);

            const introTranslateButton = await screen.findByRole('button', { name: 'Translate intro' });
            const descriptionTranslateButton = screen.getByRole('button', {
                name: 'Translate hippotherapy-description',
            });
            const quoteTranslateButton = screen.getByRole('button', { name: 'Translate hippotherapy-quote' });
            const hippoventionTranslateButton = screen.getByRole('button', {
                name: 'Translate hippotherapy-hippovention',
            });
            const analysisTranslateButton = screen.getByRole('button', {
                name: 'Translate hippotherapy-analysis',
            });
            const anotherQuoteTranslateButton = screen.getByRole('button', {
                name: 'Translate hippotherapy-another-quote',
            });

            expect(introTranslateButton).toBeEnabled();
            expect(descriptionTranslateButton).toBeEnabled();
            expect(quoteTranslateButton).toBeEnabled();
            expect(hippoventionTranslateButton).toBeEnabled();
            expect(analysisTranslateButton).toBeEnabled();
            expect(anotherQuoteTranslateButton).toBeEnabled();

            fireEvent.click(screen.getByRole('button', { name: 'Edit intro' }));

            expect(introTranslateButton).toBeDisabled();
            expect(descriptionTranslateButton).toBeDisabled();
            expect(quoteTranslateButton).toBeDisabled();
            expect(hippoventionTranslateButton).toBeDisabled();
            expect(analysisTranslateButton).toBeDisabled();
            expect(anotherQuoteTranslateButton).toBeDisabled();
        });

        it.each([
            [
                'intro',
                'introSection',
                { title: 'English Title', description: 'English Description' },
                'hippotherapy-description',
            ],
            [
                'hippotherapy-description',
                'descriptionSection',
                { title: 'English Title', description: 'English Description' },
                'intro',
            ],
            [
                'hippotherapy-quote',
                'quoteSection',
                { quoteText: 'English quote', authorName: 'English author' },
                'hippotherapy-another-quote',
            ],
            [
                'hippotherapy-hippovention',
                'hippoventionSection',
                { title: 'English Title', description: 'English Description' },
                'hippotherapy-analysis',
            ],
            [
                'hippotherapy-analysis',
                'analysisSection',
                { title: 'English Title', description: 'English Description' },
                'hippotherapy-hippovention',
            ],
            [
                'hippotherapy-another-quote',
                'anotherQuoteSection',
                { quoteText: 'English quote', authorName: 'English author' },
                'hippotherapy-quote',
            ],
        ])(
            'disables the %s translation icon when an English translation already exists',
            async (fieldIdPrefix, sectionKey, sectionContent, otherFieldIdPrefix) => {
                const contentWithTranslation: HippotherapyPageContentModel = {
                    ...buildContent(),
                    localizations: [
                        {
                            language: { id: 2, code: 'en' },
                            translationStatus: 1 as any,
                            [sectionKey]: sectionContent,
                        } as any,
                    ],
                };
                mockedHippotherapyPageApi.get.mockResolvedValue(contentWithTranslation);

                render(<HippotherapyPageContent />);

                expect(await screen.findByRole('button', { name: `Translate ${fieldIdPrefix}` })).toBeDisabled();
                expect(screen.getByRole('button', { name: `Translate ${otherFieldIdPrefix}` })).toBeEnabled();
            },
        );

        it('disables the translation icon while the page is being published', async () => {
            mockedHippotherapyPageApi.get.mockResolvedValue(buildContent());
            mockedHippotherapyPageApi.update.mockReturnValue(new Promise(() => {}));

            render(<HippotherapyPageContent />);

            await screen.findByTestId('section-intro');
            fireEvent.click(screen.getByRole('button', { name: 'Edit intro' }));
            fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED }));
            fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

            await waitFor(() =>
                expect(screen.getByRole('button', { name: 'Translate hippotherapy-another-quote' })).toBeDisabled(),
            );
        });

        it('hides the translation icons while no translation languages are available', async () => {
            mockedUseLocalizationToolkit.mockReturnValue({ translationLanguages: [] });
            mockedHippotherapyPageApi.get.mockResolvedValue(buildContent());

            render(<HippotherapyPageContent />);

            await screen.findByTestId('section-hippotherapy-quote');
            expect(screen.queryByRole('button', { name: /^Translate / })).not.toBeInTheDocument();
        });

        it('disables the translation icons when the page has not been created yet', async () => {
            jest.spyOn(axios, 'isAxiosError').mockImplementation((error: unknown) => Boolean((error as any)?.response));
            mockedHippotherapyPageApi.get.mockRejectedValue({ response: { status: 404 } });

            render(<HippotherapyPageContent />);

            expect(await screen.findByRole('button', { name: 'Translate intro' })).toBeDisabled();
            expect(screen.getByRole('button', { name: 'Translate hippotherapy-description' })).toBeDisabled();
            expect(screen.getByRole('button', { name: 'Translate hippotherapy-quote' })).toBeDisabled();
            expect(screen.getByRole('button', { name: 'Translate hippotherapy-hippovention' })).toBeDisabled();
            expect(screen.getByRole('button', { name: 'Translate hippotherapy-analysis' })).toBeDisabled();
            expect(screen.getByRole('button', { name: 'Translate hippotherapy-another-quote' })).toBeDisabled();
        });

        it('shows an error toast when the translation languages fail to load', async () => {
            mockedHippotherapyPageApi.get.mockResolvedValue(buildContent());

            render(<HippotherapyPageContent />);
            await screen.findByTestId('section-intro');

            const { setErrorState } = mockedUseLocalizationToolkit.mock.calls[0][0];
            setErrorState(COMMON_TEXT_ADMIN.LOCALIZATION.LANGUAGES.MESSAGE.FAILED_TO_FETCH_LANGUAGES, 'languages');

            expect(mockAddToast).toHaveBeenCalledWith(
                COMMON_TEXT_ADMIN.LOCALIZATION.LANGUAGES.MESSAGE.FAILED_TO_FETCH_LANGUAGES,
                ToastType.Error,
            );
        });
    });
});
