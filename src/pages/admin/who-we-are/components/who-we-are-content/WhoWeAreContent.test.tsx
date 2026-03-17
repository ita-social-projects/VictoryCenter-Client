import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { WhoWeAreContent } from './WhoWeAreContent';
import { WhoWeAreApi } from '@/services/api/admin/who-we-are/who-we-are-api';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { WhoWeAreCategory, WhoWeAreSection, Content } from '@/types/admin/who-we-are';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { ToastType } from '@/types/admin/toast';
import { ContentType, SectionType } from '@/types/common/about-us';
import { WHO_WE_ARE_TEXT } from '@/const/admin/who-we-are';
import { MainSectionProps } from '@/pages/admin/who-we-are/components/sections-wrapper/SectionsWrapper';

const mockUseLocalizationToolkit = jest.fn();
const mockUseModalsState = jest.fn();

jest.mock('@/components/common/inline-loader/InlineLoader', () => ({
    InlineLoader: () => <div data-testid="inline-loader" />,
}));

jest.mock('@/hooks/admin/use-localization-toolkit/useLocalizationToolkit', () => ({
    useLocalizationToolkit: (...args: unknown[]) => mockUseLocalizationToolkit(...args),
}));

jest.mock('@/hooks/admin/use-modals-state/useModalsState', () => ({
    useModalsState: (...args: unknown[]) => mockUseModalsState(...args),
}));

jest.mock('../who-we-are-page-toolbar/WhoWeArePageToolbar', () => ({
    WhoWeArePageToolbar: () => (
        <div className="toolbar" data-testid="who-we-are-page-toolbar">
            <div className="toolbar-actions">
                <div className="toolkit" data-testid="localization-toolkit">
                    <div className="select select-closed">
                        <button className="select-head" type="button">
                            <svg />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    ),
}));

jest.mock('@/pages/admin/who-we-are/components/modals/WhoWeAreModals', () => ({
    WhoWeAreModals: ({ onTranslateWhoWeAreSection }: any) => (
        <div data-testid="who-we-are-modals">
            <button
                data-testid="trigger-translate-success"
                onClick={() =>
                    onTranslateWhoWeAreSection({
                        id: 1,
                        title: 'Translated section',
                        sectionType: 0,
                        contents: [],
                    })
                }
            >
                Trigger translate success
            </button>
        </div>
    ),
}));

jest.mock('@/services/api/admin/who-we-are/who-we-are-api');
const mockedWhoWeAreApi = WhoWeAreApi as jest.Mocked<typeof WhoWeAreApi>;

jest.mock('@/hooks/admin/use-admin-client/useAdminClient');
const mockedUseAdminClient = useAdminClient as jest.Mock;

jest.mock('@/contexts/admin/toast-context-provider/ToastContextProvider');
const mockedUseToast = useToast as jest.Mock;

jest.mock('@/components/admin/category-bar/CategoryBar', () => ({
    CategoryBar: ({ categories, onCategorySelect, getCategoryDisplayName, getCategoryKey, renderCategoryExtra }: any) => (
        <div>
            {categories.map((cat: any) => (
                <div key={cat.id}>
                    <button onClick={() => onCategorySelect(cat)}>{getCategoryDisplayName(cat)}</button>
                    <span data-testid={`category-key-${cat.id}`}>{String(getCategoryKey(cat))}</span>
                    <div data-testid={`category-extra-${cat.id}`}>{renderCategoryExtra(cat)}</div>
                </div>
            ))}
        </div>
    ),
}));

jest.mock('@/components/admin/localization-statuses/LocalizationStatuses', () => ({
    LocalizationStatuses: () => <div data-testid="localization-statuses" />,
}));

jest.mock('../sections-wrapper/SectionsWrapper', () => ({
    SectionsWrapper: ({ section, onChange, onPublish, isPublishButtonActive, handleOnTranslateContent }: any) => (
        <div>
            <h2>{section?.title}</h2>
            {section?.contents.map((content: Content) => (
                <div key={content.id}>
                    {content.title && <p>{content.title}</p>}
                    {content.description && <p>{content.description}</p>}
                    <input
                        data-testid={`input-${content.id}`}
                        onChange={(e) => {
                            onChange({ ...content, description: e.target.value });
                        }}
                    />
                </div>
            ))}

            <button onClick={onPublish} disabled={!isPublishButtonActive}>
                Publish
            </button>
            <button onClick={() => handleOnTranslateContent(section)}>Open translate</button>
        </div>
    ),
}));

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: ({ isOpen, onConfirm, onCancel, title }: any) =>
        isOpen ? (
            <div>
                <h3>{title}</h3>
                <button onClick={onConfirm}>Confirm</button>
                <button onClick={onCancel}>Cancel</button>
            </div>
        ) : null,
}));

jest.mock('@/components/admin/toast/toast-container/ToastContainer', () => ({
    ToastContainer: () => <div data-testid="toast-container" />,
}));

const mockCategories: WhoWeAreCategory[] = [
    { id: 1, title: 'Main', sectionType: SectionType.Main, translationStatuses: [] },
    { id: 2, title: 'People', sectionType: SectionType.People, translationStatuses: [] },
];

const mockSection1: WhoWeAreSection = {
    id: 1,
    title: 'What we do',
    sectionType: SectionType.Main,
    contents: [
        {
            id: 1,
            contentType: ContentType.Image,
            description: 'Initial Description',
            title: null,
            image: { id: 1, url: 'url1.jpg', mimeType: 'image/png' },
            imageId: 1,
            localizations: [],
        },
    ],
};

const mockSection2: WhoWeAreSection = {
    id: 2,
    title: 'Mission Section',
    sectionType: SectionType.People,
    contents: [
        {
            id: 2,
            contentType: ContentType.Title,
            title: 'Our Goal',
            image: null,
            imageId: null,
            description: null,
            localizations: [],
        },
    ],
};

describe('WhoWeAreContent Component', () => {
    let mockAddToast: jest.Mock;
    let mockRetryFetchLanguages: jest.Mock;
    let mockOpenEditTranslationModal: jest.Mock;
    let mockOpenTranslateItemModal: jest.Mock;

    const getDefaultLocalizationToolkitValue = () => ({
        allLanguages: [
            { id: 1, code: 'uk', name: 'Ukrainian' },
            { id: 2, code: 'en', name: 'English' },
        ],
        translationLanguages: [
            { id: 1, code: 'uk', name: 'Ukrainian' },
            { id: 2, code: 'en', name: 'English' },
        ],
        selectedLanguage: { id: 1, code: 'uk', name: 'Ukrainian' },
        onLanguageChange: jest.fn(),
        translationStatusFilter: 0,
        onTranslationStatusFilterChange: jest.fn(),
        retryFetchLanguages: mockRetryFetchLanguages,
    });

    beforeEach(() => {
        jest.clearAllMocks();
        mockedUseAdminClient.mockReturnValue({ client: 'mocked-client' });
        mockAddToast = jest.fn();
        mockRetryFetchLanguages = jest.fn();
        mockOpenEditTranslationModal = jest.fn();
        mockOpenTranslateItemModal = jest.fn();

        mockUseLocalizationToolkit.mockReturnValue(getDefaultLocalizationToolkitValue());
        mockUseModalsState.mockReturnValue({
            isAnyModalOpened: false,
            openModalActions: {
                openEditTranslationModal: mockOpenEditTranslationModal,
                openTranslateItemModal: mockOpenTranslateItemModal,
            },
        });

        mockedUseToast.mockReturnValue({ addToast: mockAddToast });
    });

    it('should fetch categories and the first section content on initial render', async () => {
        mockedWhoWeAreApi.getPreviews.mockResolvedValue(mockCategories);
        mockedWhoWeAreApi.getByType.mockResolvedValue(mockSection1);

        render(<WhoWeAreContent />);

        expect(await screen.findByText('Main')).toBeInTheDocument();
        expect(screen.getByText('People')).toBeInTheDocument();
        expect(await screen.findByText('What we do')).toBeInTheDocument();

        expect(mockedWhoWeAreApi.getPreviews).toHaveBeenCalledTimes(1);
        expect(mockedWhoWeAreApi.getByType).toHaveBeenCalledTimes(1);
        expect(mockedWhoWeAreApi.getByType).toHaveBeenCalledWith({ client: 'mocked-client' }, SectionType.Main);
        expect(screen.getByTestId('category-key-1')).toHaveTextContent('1');
        expect(screen.getByTestId('category-extra-1')).toBeInTheDocument();
    });

    it('should display an error if fetching categories fails', async () => {
        mockedWhoWeAreApi.getPreviews.mockRejectedValue(new Error('API Error'));

        render(<WhoWeAreContent />);

        const errorMessage = await screen.findByText(WHO_WE_ARE_TEXT.FAIL_TO_FETCH_PREVIEWS);
        expect(errorMessage).toBeInTheDocument();
        expect(mockedWhoWeAreApi.getByType).not.toHaveBeenCalled();
    });

    it('should display an error if fetching a section fails', async () => {
        mockedWhoWeAreApi.getPreviews.mockResolvedValue(mockCategories);
        mockedWhoWeAreApi.getByType.mockRejectedValue(new Error('API Error'));

        render(<WhoWeAreContent />);

        expect(await screen.findByText('Main')).toBeInTheDocument();

        const errorMessage = await screen.findByText(WHO_WE_ARE_TEXT.FAIL_TO_FETCH_SECTION);
        expect(errorMessage).toBeInTheDocument();
    });

    it('should handle gracefully when no categories are returned', async () => {
        mockedWhoWeAreApi.getPreviews.mockResolvedValue([]);
        render(<WhoWeAreContent />);

        await waitFor(() => {
            expect(mockedWhoWeAreApi.getPreviews).toHaveBeenCalledTimes(1);
        });

        expect(screen.queryByText('Main')).not.toBeInTheDocument();
        expect(mockedWhoWeAreApi.getByType).not.toHaveBeenCalled();
    });

    it('should fetch new section data when a different category is selected', async () => {
        mockedWhoWeAreApi.getPreviews.mockResolvedValue(mockCategories);
        mockedWhoWeAreApi.getByType.mockResolvedValueOnce(mockSection1).mockResolvedValueOnce(mockSection2);

        render(<WhoWeAreContent />);

        expect(await screen.findByText('Main')).toBeInTheDocument();
        expect(await screen.findByText('What we do')).toBeInTheDocument();

        expect(mockedWhoWeAreApi.getPreviews).toHaveBeenCalledTimes(1);
        expect(mockedWhoWeAreApi.getByType).toHaveBeenCalledTimes(1);
        expect(mockedWhoWeAreApi.getByType).toHaveBeenLastCalledWith({ client: 'mocked-client' }, SectionType.Main);

        fireEvent.click(screen.getByText('People'));

        expect(await screen.findByText('Mission Section')).toBeInTheDocument();
        expect(screen.queryByText('What we do')).not.toBeInTheDocument();

        expect(mockedWhoWeAreApi.getByType).toHaveBeenCalledTimes(2);
        expect(mockedWhoWeAreApi.getByType).toHaveBeenLastCalledWith({ client: 'mocked-client' }, SectionType.People);
    });

    it('should open confirmation modal on publish click, then publish on confirm and disable button', async () => {
        const updatedDescription = 'A new beginning.';
        const updatedSection = {
            ...mockSection1,
            contents: [{ ...mockSection1.contents[0], description: updatedDescription }],
        };
        mockedWhoWeAreApi.getPreviews.mockResolvedValue(mockCategories);
        mockedWhoWeAreApi.getByType.mockResolvedValue(JSON.parse(JSON.stringify(mockSection1)));
        mockedWhoWeAreApi.updateContent.mockResolvedValue(updatedSection);

        render(<WhoWeAreContent />);
        expect(await screen.findByText('What we do')).toBeInTheDocument();
        const input = screen.getByTestId('input-1');
        const publishButton = screen.getByRole('button', { name: 'Publish' });

        expect(publishButton).toBeDisabled();

        fireEvent.change(input, { target: { value: updatedDescription } });

        expect(publishButton).toBeEnabled();
        fireEvent.click(publishButton);

        expect(await screen.findByText(COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES)).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

        await waitFor(() => {
            const expectedPayload = [
                {
                    ...mockSection1.contents[0],
                    description: updatedDescription,
                },
            ];
            expect(mockedWhoWeAreApi.updateContent).toHaveBeenCalledWith(
                { client: 'mocked-client' },
                expectedPayload,
                SectionType.Main,
            );
        });

        await waitFor(() => {
            expect(mockAddToast).toHaveBeenCalledWith(COMMON_TEXT_ADMIN.MESSAGE.SUCCESSFULLY_PUBLISHED, ToastType.Info);
        });

        await waitFor(() => {
            expect(mockedWhoWeAreApi.getPreviews).toHaveBeenCalledTimes(2);
        });

        await waitFor(() => {
            expect(publishButton).toBeDisabled();
        });
    });

    it('should display the loader while categories are loading', () => {
        mockedWhoWeAreApi.getPreviews.mockReturnValue(new Promise(() => {}));

        mockedWhoWeAreApi.getByType.mockReturnValue(new Promise(() => {}));

        render(<WhoWeAreContent />);

        expect(screen.getByTestId('inline-loader')).toBeInTheDocument();

        expect(screen.queryByText('Main')).not.toBeInTheDocument();
        expect(screen.queryByText(WHO_WE_ARE_TEXT.FAIL_TO_FETCH_PREVIEWS)).not.toBeInTheDocument();
    });

    it('should display the loader while the selected section is loading', async () => {
        mockedWhoWeAreApi.getPreviews.mockResolvedValue(mockCategories);

        mockedWhoWeAreApi.getByType.mockReturnValue(new Promise(() => {}));

        render(<WhoWeAreContent />);

        expect(await screen.findByText('Main')).toBeInTheDocument();

        expect(await screen.findByTestId('inline-loader')).toBeInTheDocument();

        expect(screen.queryByText('What we do')).not.toBeInTheDocument();
        expect(screen.queryByText(WHO_WE_ARE_TEXT.FAIL_TO_FETCH_SECTION)).not.toBeInTheDocument();
    });

    it('should call refetch when retrying after section fetch error', async () => {
        mockedWhoWeAreApi.getPreviews.mockResolvedValue(mockCategories);
        mockedWhoWeAreApi.getByType.mockRejectedValueOnce(new Error('API Error'));

        render(<WhoWeAreContent />);

        expect(await screen.findByText('Main')).toBeInTheDocument();
        const retryButton = await screen.findByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.TRY_AGAIN });

        mockedWhoWeAreApi.getByType.mockResolvedValueOnce(mockSection1);
        fireEvent.click(retryButton);

        await waitFor(() => {
            expect(mockedWhoWeAreApi.getByType).toHaveBeenLastCalledWith({ client: 'mocked-client' }, SectionType.Main);
        });
    });

    it('should show toast with error when publish fails', async () => {
        mockedWhoWeAreApi.getPreviews.mockResolvedValue(mockCategories);
        mockedWhoWeAreApi.getByType.mockResolvedValue(mockSection1);
        mockedWhoWeAreApi.updateContent.mockRejectedValueOnce(new Error('Update failed'));

        render(<WhoWeAreContent />);
        const input = await screen.findByTestId('input-1');
        const publishButton = await screen.findByRole('button', { name: 'Publish' });

        fireEvent.change(input, { target: { value: 'Updated' } });
        fireEvent.click(publishButton);

        expect(await screen.findByText(COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES)).toBeInTheDocument();

        fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

        await waitFor(() => {
            expect(mockAddToast).toHaveBeenCalledWith(
                COMMON_TEXT_ADMIN.MESSAGE.FAIL_TO_PUBLISH_CHANGES,
                ToastType.Error,
            );
        });
    });

    it('should set languages error state and allow retrying', async () => {
        let injectedSetErrorState: any = null;

        mockUseLocalizationToolkit.mockImplementation(({ setErrorState }: any) => {
            injectedSetErrorState = setErrorState;
            return {
                allLanguages: [],
                translationLanguages: [],
                selectedLanguage: null,
                onLanguageChange: jest.fn(),
                retryFetchLanguages: mockRetryFetchLanguages,
            };
        });

        mockedWhoWeAreApi.getPreviews.mockResolvedValue(mockCategories);
        mockedWhoWeAreApi.getByType.mockResolvedValue(mockSection1);

        render(<WhoWeAreContent />);

        await waitFor(() => {
            expect(injectedSetErrorState).toBeTruthy();
        });

        injectedSetErrorState('Languages failed to load', 'languages');

        const errorMessage = await screen.findByText('Languages failed to load');
        expect(errorMessage).toBeInTheDocument();

        const retryButton = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.TRY_AGAIN });
        fireEvent.click(retryButton);

        expect(mockRetryFetchLanguages).toHaveBeenCalled();
    });

    it('should not throw error if categories are loaded but fetch by type returns no contents', async () => {
        const mockEmptySection = { ...mockSection1, contents: [] };
        mockedWhoWeAreApi.getPreviews.mockResolvedValue(mockCategories);
        mockedWhoWeAreApi.getByType.mockResolvedValue(mockEmptySection);

        render(<WhoWeAreContent />);

        expect(await screen.findByText('Main')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.queryByTestId('input-1')).not.toBeInTheDocument();
        });
    });

    it('opens edit translation modal when english localization already exists', async () => {
        const sectionWithEnglishLocalization: WhoWeAreSection = {
            ...mockSection1,
            contents: [
                {
                    ...mockSection1.contents[0],
                    localizations: [{ language: { id: 2, code: 'en' }, translationStatus: 1 } as any],
                },
            ],
        };

        mockedWhoWeAreApi.getPreviews.mockResolvedValue(mockCategories);
        mockedWhoWeAreApi.getByType.mockResolvedValue(sectionWithEnglishLocalization);

        render(<WhoWeAreContent />);

        expect(await screen.findByText('What we do')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Open translate' }));

        expect(mockOpenEditTranslationModal).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
        expect(mockOpenTranslateItemModal).not.toHaveBeenCalled();
    });

    it('opens add translation modal when english localization does not exist', async () => {
        mockedWhoWeAreApi.getPreviews.mockResolvedValue(mockCategories);
        mockedWhoWeAreApi.getByType.mockResolvedValue(mockSection1);

        render(<WhoWeAreContent />);

        expect(await screen.findByText('What we do')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Open translate' }));

        expect(mockOpenTranslateItemModal).toHaveBeenCalledWith(expect.objectContaining({ id: 1 }));
        expect(mockOpenEditTranslationModal).not.toHaveBeenCalled();
    });

    it('does not open translate modal when any modal is already open', async () => {
        mockUseModalsState.mockReturnValue({
            isAnyModalOpened: true,
            openModalActions: {
                openEditTranslationModal: mockOpenEditTranslationModal,
                openTranslateItemModal: mockOpenTranslateItemModal,
            },
        });

        mockedWhoWeAreApi.getPreviews.mockResolvedValue(mockCategories);
        mockedWhoWeAreApi.getByType.mockResolvedValue(mockSection1);

        render(<WhoWeAreContent />);

        expect(await screen.findByText('What we do')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Open translate' }));

        expect(mockOpenEditTranslationModal).not.toHaveBeenCalled();
        expect(mockOpenTranslateItemModal).not.toHaveBeenCalled();
    });

    it('handles successful translation callback from modal and refetches categories', async () => {
        mockedWhoWeAreApi.getPreviews.mockResolvedValue(mockCategories);
        mockedWhoWeAreApi.getByType.mockResolvedValue(mockSection1);

        render(<WhoWeAreContent />);

        expect(await screen.findByText('What we do')).toBeInTheDocument();

        fireEvent.click(screen.getByTestId('trigger-translate-success'));

        await waitFor(() => {
            expect(mockAddToast).toHaveBeenCalledWith(
                COMMON_TEXT_ADMIN.MESSAGE.TRANSLATION_PUBLISHED_SUCCESS,
                ToastType.Success,
            );
        });

        await waitFor(() => {
            expect(mockedWhoWeAreApi.getPreviews).toHaveBeenCalledTimes(2);
        });
    });

    it('closes confirmation modal on cancel', async () => {
        mockedWhoWeAreApi.getPreviews.mockResolvedValue(mockCategories);
        mockedWhoWeAreApi.getByType.mockResolvedValue(mockSection1);

        render(<WhoWeAreContent />);

        expect(await screen.findByText('What we do')).toBeInTheDocument();

        fireEvent.change(screen.getByTestId('input-1'), { target: { value: 'Updated' } });
        fireEvent.click(screen.getByRole('button', { name: 'Publish' }));

        expect(await screen.findByText(COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES)).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

        await waitFor(() => {
            expect(screen.queryByText(COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES)).not.toBeInTheDocument();
        });
    });
});
