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

jest.mock('@/components/common/inline-loader/InlineLoader', () => ({
    InlineLoader: () => <div data-testid="inline-loader" />,
}));

jest.mock('@/services/api/admin/who-we-are/who-we-are-api');
const mockedWhoWeAreApi = WhoWeAreApi as jest.Mocked<typeof WhoWeAreApi>;

jest.mock('@/hooks/admin/use-admin-client/useAdminClient');
const mockedUseAdminClient = useAdminClient as jest.Mock;

jest.mock('@/contexts/admin/toast-context-provider/ToastContextProvider');
const mockedUseToast = useToast as jest.Mock;

jest.mock('@/components/admin/category-bar/CategoryBar', () => ({
    CategoryBar: ({ categories, onCategorySelect, getCategoryDisplayName }: any) => (
        <div>
            {categories.map((cat: any) => (
                <button key={cat.id} onClick={() => onCategorySelect(cat)}>
                    {getCategoryDisplayName(cat)}
                </button>
            ))}
        </div>
    ),
}));

jest.mock('../sections-wrapper/SectionsWrapper', () => ({
    SectionsWrapper: ({
        section,
        onChange,
        onPublish,
        setIsPublishButtonActive,
        isPublishButtonActive,
    }: MainSectionProps) => (
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
                            setIsPublishButtonActive(true);
                        }}
                    />
                </div>
            ))}

            <button onClick={onPublish} disabled={!isPublishButtonActive}>
                Publish
            </button>
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
    { id: 1, title: 'Main', sectionType: SectionType.Main },
    { id: 2, title: 'People', sectionType: SectionType.People },
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
        },
    ],
};

const mockSection2: WhoWeAreSection = {
    id: 2,
    title: 'Mission Section',
    sectionType: SectionType.People,
    contents: [
        { id: 2, contentType: ContentType.Title, title: 'Our Goal', image: null, imageId: null, description: null },
    ],
};

describe('WhoWeAreContent Component', () => {
    let mockAddToast: jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        mockedUseAdminClient.mockReturnValue({ client: 'mocked-client' });
        mockAddToast = jest.fn();
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
});
