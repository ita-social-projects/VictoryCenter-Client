import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FeedbackComponent, FeedbackComponentProps } from './FeedbackComponent';
import { FEEDBACK_TEXT } from '@/const/admin/feedback';
import { VisibilityStatus } from '@/types/admin/common';
import { FeedbackHistoryDto, FeedbackReviewDto } from '@/types/admin/feedback';

jest.mock('@/assets/icons/blank-user.svg', () => ({
    ReactComponent: (props: any) => <svg {...props} data-testid="blank-user-icon" />,
}));

const mockHistoryItem: FeedbackHistoryDto = {
    id: 1,
    title: 'Історія успіху',
    story: 'Детальний опис історії успіху',
    image: { id: 10, url: 'https://example.com/photo.jpg', mimeType: 'image/jpeg' },
    status: VisibilityStatus.Published,
    priority: 0,
};

const mockReviewItem: FeedbackReviewDto = {
    id: 2,
    authorName: 'Олена Петренко',
    text: 'Чудовий центр реабілітації!',
    status: VisibilityStatus.Published,
    priority: 1,
};

describe('FeedbackComponent', () => {
    let onEditMock: jest.Mock;
    let onDeleteMock: jest.Mock;

    beforeEach(() => {
        onEditMock = jest.fn();
        onDeleteMock = jest.fn();
    });

    const renderComponent = (props: Partial<FeedbackComponentProps> = {}) =>
        render(<FeedbackComponent item={mockHistoryItem} onEdit={onEditMock} onDelete={onDeleteMock} {...props} />);

    it('renders history item title and description correctly', () => {
        renderComponent({ item: mockHistoryItem });

        expect(screen.getByText('Історія успіху')).toBeInTheDocument();
        expect(screen.getByText('Детальний опис історії успіху')).toBeInTheDocument();
    });

    it('renders review item authorName and text correctly', () => {
        renderComponent({ item: mockReviewItem });

        expect(screen.getByText('Олена Петренко')).toBeInTheDocument();
        expect(screen.getByText('Чудовий центр реабілітації!')).toBeInTheDocument();
    });

    it('renders empty string fallbacks when title/authorName and description fields are missing', () => {
        const minimalItem = {
            id: 99,
            status: VisibilityStatus.Published,
            priority: 0,
        } as any;

        renderComponent({ item: minimalItem });
        expect(screen.getByRole('button', { name: FEEDBACK_TEXT.ACTIONS.EDIT })).toBeInTheDocument();
    });

    it('does not render photo when showPhoto is false (default)', () => {
        renderComponent({ item: mockHistoryItem, showPhoto: false });

        expect(screen.queryByRole('img')).not.toBeInTheDocument();
        expect(screen.queryByTestId('blank-user-icon')).not.toBeInTheDocument();
    });

    it('renders image when showPhoto is true and imageUrl is valid', () => {
        renderComponent({ item: mockHistoryItem, showPhoto: true });

        const img = screen.getByRole('img');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', 'https://example.com/photo.jpg');
        expect(img).toHaveAttribute('alt', 'Історія успіху');
    });

    it('renders fallback icon when showPhoto is true and image is null', () => {
        renderComponent({ item: { ...mockHistoryItem, image: null }, showPhoto: true });

        expect(screen.queryByRole('img')).not.toBeInTheDocument();
        expect(screen.getByTestId('blank-user-icon')).toBeInTheDocument();
    });

    it('renders fallback icon when image fails to load (onError)', () => {
        renderComponent({ item: mockHistoryItem, showPhoto: true });

        const img = screen.getByRole('img');
        fireEvent.error(img);

        expect(screen.queryByRole('img')).not.toBeInTheDocument();
        expect(screen.getByTestId('blank-user-icon')).toBeInTheDocument();
    });

    it('resets image error when imageUrl changes', () => {
        const { rerender } = render(
            <FeedbackComponent item={mockHistoryItem} showPhoto={true} onEdit={onEditMock} onDelete={onDeleteMock} />,
        );

        const img = screen.getByRole('img');
        fireEvent.error(img);
        expect(screen.getByTestId('blank-user-icon')).toBeInTheDocument();

        rerender(
            <FeedbackComponent
                item={{
                    ...mockHistoryItem,
                    image: { id: 11, url: 'https://example.com/new-photo.jpg', mimeType: 'image/jpeg' },
                }}
                showPhoto={true}
                onEdit={onEditMock}
                onDelete={onDeleteMock}
            />,
        );

        const newImg = screen.getByRole('img');
        expect(newImg).toBeInTheDocument();
        expect(newImg).toHaveAttribute('src', 'https://example.com/new-photo.jpg');
    });

    it('calls onEdit with item and stops propagation when edit button is clicked', () => {
        renderComponent({ item: mockHistoryItem });

        const editBtn = screen.getByRole('button', { name: FEEDBACK_TEXT.ACTIONS.EDIT });
        fireEvent.click(editBtn);

        expect(onEditMock).toHaveBeenCalledTimes(1);
        expect(onEditMock).toHaveBeenCalledWith(mockHistoryItem);
    });

    it('calls onDelete with item and stops propagation when delete button is clicked', () => {
        renderComponent({ item: mockHistoryItem });

        const deleteBtn = screen.getByRole('button', { name: FEEDBACK_TEXT.ACTIONS.DELETE });
        fireEvent.click(deleteBtn);

        expect(onDeleteMock).toHaveBeenCalledTimes(1);
        expect(onDeleteMock).toHaveBeenCalledWith(mockHistoryItem);
    });

    it('does not throw when clicking buttons without onEdit or onDelete handlers provided', () => {
        render(<FeedbackComponent item={mockHistoryItem} />);

        const editBtn = screen.getByRole('button', { name: FEEDBACK_TEXT.ACTIONS.EDIT });
        const deleteBtn = screen.getByRole('button', { name: FEEDBACK_TEXT.ACTIONS.DELETE });

        expect(() => {
            fireEvent.click(editBtn);
            fireEvent.click(deleteBtn);
        }).not.toThrow();
    });
});
