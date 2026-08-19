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
import { HippotherapyPageContentModel } from '@/types/admin/hippotherapy-page';

jest.mock('@/components/common/inline-loader/InlineLoader', () => ({
    InlineLoader: () => <div data-testid="inline-loader" />,
}));

jest.mock('@/components/admin/toast/toast-container/ToastContainer', () => ({
    ToastContainer: () => <div data-testid="toast-container" />,
}));

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: ({ isOpen, onConfirm, onCancel, title }: any) =>
        isOpen ? (
            <div data-testid="confirmation-modal">
                <h3>{title}</h3>
                <button onClick={onConfirm}>Confirm</button>
                <button onClick={onCancel}>Cancel</button>
            </div>
        ) : null,
}));

jest.mock('../sections/intro-banner-section/IntroBannerSection', () => ({
    IntroBannerSection: ({ value, onChange, onImageError, disabled }: any) => (
        <div data-testid="section-intro">
            <span>{value.title}</span>
            <button disabled={disabled} onClick={() => onChange({ ...value, title: 'Edited intro title' })}>
                Edit intro
            </button>
            <button onClick={() => onImageError?.('image size error')}>Set intro image error</button>
            <button onClick={() => onImageError?.(null)}>Clear intro image error</button>
        </div>
    ),
}));

jest.mock('../sections/text-card-section/TextCardSection', () => ({
    TextCardSection: ({ value, onChange, fieldIdPrefix, disabled }: any) => (
        <div data-testid={`section-${fieldIdPrefix}`}>
            <span>{value.title}</span>
            <button disabled={disabled} onClick={() => onChange({ ...value, title: 'Edited text card title' })}>
                Edit {fieldIdPrefix}
            </button>
        </div>
    ),
}));

jest.mock('../sections/hippotherapy-quote-section/HippotherapyQuoteSection', () => ({
    HippotherapyQuoteSection: ({ value, onChange, fieldIdPrefix, disabled }: any) => (
        <div data-testid={`section-${fieldIdPrefix}`}>
            <span>{value.quoteText}</span>
            <button disabled={disabled} onClick={() => onChange({ ...value, quoteText: 'Edited quote' })}>
                Edit {fieldIdPrefix}
            </button>
        </div>
    ),
}));

jest.mock('../sections/hippovention-center-section/HippoventionCenterSection', () => ({
    HippoventionCenterSection: ({ value, onChange, disabled }: any) => (
        <div data-testid="section-hippovention-center">
            <span>{value.title}</span>
            <button disabled={disabled} onClick={() => onChange({ ...value, title: 'Edited hippovention center' })}>
                Edit hippovention center
            </button>
        </div>
    ),
}));

jest.mock('../sections/gallery-section/GallerySection', () => ({
    GallerySection: ({ value, onChange, fieldIdPrefix, disabled }: any) => (
        <div data-testid={`section-${fieldIdPrefix}`}>
            <span>{value.title}</span>
            <button disabled={disabled} onClick={() => onChange({ ...value, title: 'Edited gallery title' })}>
                Edit {fieldIdPrefix}
            </button>
        </div>
    ),
}));

jest.mock('../sections/scientific-references-section/ScientificReferencesSection', () => ({
    ScientificReferencesSection: ({ value, onChange, disabled }: any) => (
        <div data-testid="section-research">
            <span>{value.title}</span>
            <button disabled={disabled} onClick={() => onChange({ ...value, title: 'Edited research title' })}>
                Edit research
            </button>
        </div>
    ),
}));

jest.mock('../sections/ethics-section/EthicsSection', () => ({
    EthicsSection: ({ value, onChange, disabled }: any) => (
        <div data-testid="section-ethics">
            <span>{value.title}</span>
            <button disabled={disabled} onClick={() => onChange({ ...value, title: 'Edited ethics title' })}>
                Edit ethics
            </button>
        </div>
    ),
}));

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

const buildContent = (): HippotherapyPageContentModel => ({
    introSection: { title: 'Intro title', description: 'Intro description', image: null, imageId: null },
    descriptionSection: { title: 'Description title', description: 'Description text' },
    quoteSection: { quoteText: 'Quote text', authorName: 'Author', image: null, imageId: null },
    hippoventionSection: { title: 'Hippovention title', description: 'Hippovention text' },
    hippoventionCenterSection: {
        title: 'Hippovention center title',
        description: 'Hippovention center text',
        pros: 'Pro one and pro two',
        image: null,
        imageId: null,
    },
    advantagesSection: {
        title: 'Advantages title',
        cards: [{ description: 'Card description', image: null, imageId: null }],
    },
    analysisSection: { title: 'Analysis title', description: 'Analysis text' },
    scientificReferencesSection: {
        title: 'Research title',
        description: 'Research text',
        scientificReferences: [{ localId: 'local-1', id: 1, name: 'Citation', url: 'https://example.com/citation' }],
    },
    anotherQuoteSection: { quoteText: 'Another quote', authorName: 'Another author', image: null, imageId: null },
    participantsSection: {
        title: 'Participants title',
        cards: [{ description: 'Participant description', image: null, imageId: null }],
    },
    ethicsSection: {
        title: 'Ethics title',
        description: 'Ethics text',
        principles: ['Principle one'],
        image: null,
        imageId: null,
    },
});

describe('HippotherapyPageContent', () => {
    const mockClient = { get: jest.fn(), put: jest.fn() };
    const mockAddToast = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        mockedUseAdminClient.mockReturnValue(mockClient);
        mockedUseToast.mockReturnValue({ addToast: mockAddToast });
        mockedIsContentValid.mockReturnValue(true);

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
    });

    it('lets the admin fill in and publish a page that did not exist yet', async () => {
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
            expect(mockAddToast).toHaveBeenCalledWith(COMMON_TEXT_ADMIN.MESSAGE.SUCCESSFULLY_PUBLISHED, ToastType.Info),
        );
        expect(mockedHippotherapyPageApi.update).toHaveBeenCalledWith(
            mockClient,
            expect.objectContaining({ introSection: expect.objectContaining({ title: 'Edited intro title' }) }),
        );
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

        fireEvent.click(screen.getByRole('button', { name: 'Set intro image error' }));
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeDisabled();

        fireEvent.click(screen.getByRole('button', { name: 'Clear intro image error' }));
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

    it('publishes changes, shows a success toast, and resets the dirty state on confirm', async () => {
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
            expect(mockAddToast).toHaveBeenCalledWith(COMMON_TEXT_ADMIN.MESSAGE.SUCCESSFULLY_PUBLISHED, ToastType.Info),
        );
        expect(mockedHippotherapyPageApi.update).toHaveBeenCalledWith(
            mockClient,
            expect.objectContaining({ introSection: expect.objectContaining({ title: 'Edited intro title' }) }),
        );
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED })).toBeDisabled();
    });

    it('shows a failure toast when publishing fails', async () => {
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
    });
});
