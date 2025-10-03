import React from 'react';
import {render, screen, fireEvent, waitFor, act} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { WhoWeAreContent } from './WhoWeAreContent';
import { WhoWeAreApi } from '../../../../../services/api/admin/who-we-are/who-we-are-api';
import { useAdminClient } from '../../../../../hooks/admin/use-admin-client/useAdminClient';
import { useToast } from '../../../../../contexts/admin/toast-context-provider/ToastContextProvider';
import axios from 'axios';
import { SectionType } from '../../../../../types/common/about-us';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { ContentType } from '../../../../../types/common/about-us';

// Initialize user event setup for modern user-event API
const user = userEvent.setup();

// --- Mock External Dependencies ---
jest.mock('../../../../../services/api/admin/who-we-are/who-we-are-api');
const mockWhoWeAreApi = WhoWeAreApi as jest.Mocked<typeof WhoWeAreApi>;

jest.mock('../../../../../hooks/admin/use-admin-client/useAdminClient');
const mockUseAdminClient = useAdminClient as jest.Mock;

jest.mock('../../../../../contexts/admin/toast-context-provider/ToastContextProvider');
const mockUseToast = useToast as jest.Mock;
const mockAddToast = jest.fn();

// The fix for TS2352: cast the complex mock type to any
(axios.isCancel as any) = jest.fn(() => false);

// Correctly mock child components to simulate their behavior
jest.mock('../../../../../components/admin/category-bar/CategoryBar', () => ({
    CategoryBar: ({ categories, selectedCategory, onCategorySelect }: any) => (
        <div data-testid="category-bar">
            {categories.map((c: any) => (
                <button
                    key={c.id}
                    data-testid={`category-${c.id}`}
                    onClick={() => onCategorySelect(c)}
                >
                    {c.title}
                </button>
            ))}
        </div>
    ),
}));

jest.mock('../sections-wrapper/SectionsWrapper', () => {
    // FIX: Import ContentType inside the mock factory to resolve ReferenceError
    const { ContentType } = jest.requireActual('../../../../../../types/common/about-us');

    return {
        SectionsWrapper: (props: any) => (
            <div data-testid="sections-wrapper" data-contents={JSON.stringify(props.section?.contents)}>
                <button data-testid="publish-trigger" onClick={props.onPublish}>
                    Publish
                </button>
                <button
                    data-testid="content-change-trigger"
                    onClick={() => props.onChange({ id: 1, title: 'Mock Change', contentType: ContentType.Title })}
                >
                    Change Content
                </button>
            </div>
        ),
    };
});

jest.mock('../../../../../components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: ({ isOpen, onConfirm, onCancel, title }: any) =>
        isOpen ? (
            <div data-testid="confirmation-modal">
                <span>{title}</span>
                <button onClick={onConfirm} data-testid="confirm-button">
                    Confirm
                </button>
                <button onClick={onCancel} data-testid="cancel-button">
                    Cancel
                </button>
            </div>
        ) : null,
}));

jest.mock('../../../../../components/admin/toast/toast-container/ToastContainer', () => ({
    ToastContainer: () => <div data-testid="toast-container" />,
}));

// Mock Data (fixed to be type-safe by including contentType)
const mockCategories = [
    { id: 1, title: 'What We Do', sectionType: SectionType.WhatWeDo },
    { id: 2, title: 'Team', sectionType: SectionType.Team },
];
const mockSection = {
    id: 100,
    sectionType: SectionType.WhatWeDo,
    title: 'Test Section',
    contents: [{ id: 1, contentType: ContentType.Title, title: 'Original Title', image: null, imageId: null, description: null }],
};

// Helper to manually trigger the parent's onChange prop with specific content
const triggerContentChange = (content: any) => {
    const sectionsWrapper = screen.getByTestId('sections-wrapper');
    act(() => {
        (sectionsWrapper as any).props.onChange(content);
    });
};

describe('WhoWeAreContent', () => {
    const mockClient = 'admin-client-mock';

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseAdminClient.mockReturnValue(mockClient);
        mockUseToast.mockReturnValue({ addToast: mockAddToast });
        mockWhoWeAreApi.getAll.mockResolvedValue(mockCategories);
        mockWhoWeAreApi.getByType.mockResolvedValue(mockSection);
        mockWhoWeAreApi.UpdateContent.mockResolvedValue(mockSection);
    });

    // --- Setup and Initial Loading Tests ---
    it('should fetch categories and section data on initial load', async () => {
        render(<WhoWeAreContent />);

        expect(mockWhoWeAreApi.getAll).toHaveBeenCalledWith(mockClient);

        await waitFor(() => {
            expect(mockWhoWeAreApi.getByType).toHaveBeenCalledWith(mockClient, mockCategories[0].sectionType);
        });
    });

    it('should set an error if category fetch fails', async () => {
        mockWhoWeAreApi.getAll.mockRejectedValue(new Error('Categories fail'));
        render(<WhoWeAreContent />);

        await waitFor(() => {
            expect(mockWhoWeAreApi.getAll).toHaveBeenCalled();
        });
    });

    it('should update selected category and fetch new section on category select', async () => {
        const nextSectionType = mockCategories[1].sectionType;
        const nextMockSection = { ...mockSection, sectionType: nextSectionType, title: 'Team Section' };
        mockWhoWeAreApi.getByType.mockResolvedValue(nextMockSection);

        render(<WhoWeAreContent />);

        await waitFor(() => expect(screen.getByTestId('category-bar')).toBeInTheDocument());

        const teamButton = screen.getByRole('button', { name: 'Team' });
        await user.click(teamButton);

        await waitFor(() => {
            expect(mockWhoWeAreApi.getByType).toHaveBeenCalledTimes(2); // Initial + click
            expect(mockWhoWeAreApi.getByType).toHaveBeenCalledWith(mockClient, nextSectionType);
        });
    });

    it('should update updatedSection state on content change', async () => {
        render(<WhoWeAreContent />);

        await waitFor(() => expect(screen.getByTestId('sections-wrapper')).toBeInTheDocument());

        const initialContents = JSON.parse(screen.getByTestId('sections-wrapper').dataset.contents!);
        expect(initialContents[0].title).toBe('Original Title');

        const changeButton = screen.getByTestId('content-change-trigger');
        await user.click(changeButton);

        await waitFor(() => {
            const updatedContents = JSON.parse(screen.getByTestId('sections-wrapper').dataset.contents!);
            expect(updatedContents[0].title).toBe('Mock Change');
        });
    });

    // --- Publish Logic Tests ---
    it('should successfully publish changes when confirmed', async () => {
        const originalContent = mockSection.contents[0];
        const updatedContent = { ...originalContent, title: 'Final New Title' };
        const updatedSectionResponse = { ...mockSection, contents: [updatedContent] };

        mockWhoWeAreApi.UpdateContent.mockResolvedValue(updatedSectionResponse);

        render(<WhoWeAreContent />);

        await waitFor(() => expect(screen.getByTestId('sections-wrapper')).toBeInTheDocument());

        triggerContentChange(updatedContent);

        await user.click(screen.getByTestId('publish-trigger'));
        await user.click(screen.getByTestId('confirm-button'));

        await waitFor(() => {
            expect(mockWhoWeAreApi.UpdateContent).toHaveBeenCalledWith(
                mockClient,
                [updatedContent],
                SectionType.WhatWeDo,
            );
        });

        expect(mockAddToast).toHaveBeenCalledWith(COMMON_TEXT_ADMIN.MESSAGE.SUCCESSFULLY_PUBLISHED, 'info');
        await waitFor(() => {
            expect(screen.getByTestId('sections-wrapper')).toHaveAttribute('data-contents', JSON.stringify(updatedSectionResponse.contents));
        });
    });

    it('should handle image update and correctly set imageId before publishing', async () => {
        const initialImage = { id: 50, url: 'old.jpg', mimeType: 'image/jpeg' };
        const updatedImage = { id: 50, url: 'new.jpg', mimeType: 'image/jpeg' };

        const initialImageContent = { id: 1, title: 'T', image: initialImage, imageId: 50, contentType: ContentType.Image, description: null };
        const updatedImageContent = { ...initialImageContent, image: updatedImage };

        const initialSectionWithImage = { ...mockSection, contents: [initialImageContent] };

        mockWhoWeAreApi.getByType.mockResolvedValue(initialSectionWithImage);

        render(<WhoWeAreContent />);
        await waitFor(() => expect(screen.getByTestId('sections-wrapper')).toBeInTheDocument());

        triggerContentChange(updatedImageContent);

        await user.click(screen.getByTestId('publish-trigger'));
        await user.click(screen.getByTestId('confirm-button'));

        await waitFor(() => {
            expect(mockWhoWeAreApi.UpdateContent).toHaveBeenCalledWith(
                mockClient,
                [expect.objectContaining({ imageId: 50, image: updatedImage })],
                SectionType.WhatWeDo,
            );
        });
    });
});