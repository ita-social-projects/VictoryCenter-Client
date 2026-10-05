import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FeedbackComponent, FeedbackComponentProps } from './FeedbackComponent';
import { FEEDBACK_TEXT } from '@/const/admin/feedback';
import { VisibilityStatus } from '@/types/admin/common';
import { FeedbackHistoryDto, FeedbackReviewDto, FeedbackVideoDto } from '@/types/admin/feedback';
import { TranslationStatus } from '@/types/common/language';
import badgeStyles from '@/components/admin/localization-statuses/LocalizationStatuses.module.scss';

const ukrainian = { id: 1, code: 'uk', name: 'Українська' };
const english = { id: 2, code: 'en', name: 'English' };

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
    localizations: [],
};

const mockReviewItem: FeedbackReviewDto = {
    id: 2,
    authorName: 'Олена Петренко',
    text: 'Чудовий центр реабілітації!',
    status: VisibilityStatus.Published,
    priority: 1,
    localizations: [],
};

const mockVideoItem: FeedbackVideoDto = {
    id: 3,
    title: 'Відео відгук',
    link: 'https://www.youtube.com/watch?v=abc123',
    status: VisibilityStatus.Published,
    priority: 2,
    localizations: [],
};

describe('FeedbackComponent', () => {
    let onEditMock: jest.Mock;
    let onDeleteMock: jest.Mock;
    let onTranslateMock: jest.Mock;

    beforeEach(() => {
        onEditMock = jest.fn();
        onDeleteMock = jest.fn();
        onTranslateMock = jest.fn();
    });

    const renderComponent = (props: Partial<FeedbackComponentProps> = {}) =>
        render(
            <FeedbackComponent
                item={mockHistoryItem}
                onEdit={onEditMock}
                onDelete={onDeleteMock}
                onTranslate={onTranslateMock}
                {...props}
            />,
        );

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

    it('renders video item title and a clickable link that opens in a new tab', () => {
        renderComponent({ item: mockVideoItem });

        expect(screen.getByText('Відео відгук')).toBeInTheDocument();

        const link = screen.getByRole('link', { name: mockVideoItem.link });
        expect(link).toHaveAttribute('href', mockVideoItem.link);
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noreferrer');
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
        const parentClickMock = jest.fn();
        render(
            <div onClick={parentClickMock}>
                <FeedbackComponent item={mockHistoryItem} onEdit={onEditMock} onDelete={onDeleteMock} />
            </div>,
        );

        const editBtn = screen.getByRole('button', { name: FEEDBACK_TEXT.ACTIONS.EDIT });
        fireEvent.click(editBtn);

        expect(onEditMock).toHaveBeenCalledTimes(1);
        expect(onEditMock).toHaveBeenCalledWith(mockHistoryItem);
        expect(parentClickMock).not.toHaveBeenCalled();
    });

    it('calls onDelete with item and stops propagation when delete button is clicked', () => {
        const parentClickMock = jest.fn();
        render(
            <div onClick={parentClickMock}>
                <FeedbackComponent item={mockHistoryItem} onEdit={onEditMock} onDelete={onDeleteMock} />
            </div>,
        );

        const deleteBtn = screen.getByRole('button', { name: FEEDBACK_TEXT.ACTIONS.DELETE });
        fireEvent.click(deleteBtn);

        expect(onDeleteMock).toHaveBeenCalledTimes(1);
        expect(onDeleteMock).toHaveBeenCalledWith(mockHistoryItem);
        expect(parentClickMock).not.toHaveBeenCalled();
    });

    it('calls onTranslate with item and stops propagation when translate button is clicked', () => {
        const parentClickMock = jest.fn();
        render(
            <div onClick={parentClickMock}>
                <FeedbackComponent item={mockHistoryItem} onTranslate={onTranslateMock} />
            </div>,
        );

        const translateBtn = screen.getByRole('button', { name: FEEDBACK_TEXT.ACTIONS.TRANSLATE });
        fireEvent.click(translateBtn);

        expect(onTranslateMock).toHaveBeenCalledTimes(1);
        expect(onTranslateMock).toHaveBeenCalledWith(mockHistoryItem);
        expect(parentClickMock).not.toHaveBeenCalled();
    });

    describe('localization', () => {
        const translatedHistory: FeedbackHistoryDto = {
            ...mockHistoryItem,
            localizations: [
                {
                    language: english,
                    translationStatus: TranslationStatus.Relevant,
                    title: 'Success story',
                    story: 'Detailed success story',
                },
            ],
        };

        it('shows the English translation when English is selected', () => {
            renderComponent({ item: translatedHistory, language: english });

            expect(screen.getByText('Success story')).toBeInTheDocument();
            expect(screen.getByText('Detailed success story')).toBeInTheDocument();
        });

        it('shows the base Ukrainian text when Ukrainian is selected', () => {
            renderComponent({ item: translatedHistory, language: ukrainian });

            expect(screen.getByText('Історія успіху')).toBeInTheDocument();
            expect(screen.getByText('Детальний опис історії успіху')).toBeInTheDocument();
        });

        it('falls back to the base text when the selected language has no translation', () => {
            renderComponent({ item: mockReviewItem, language: english });

            expect(screen.getByText('Олена Петренко')).toBeInTheDocument();
            expect(screen.getByText('Чудовий центр реабілітації!')).toBeInTheDocument();
        });

        it('shows translated review author and text', () => {
            renderComponent({
                item: {
                    ...mockReviewItem,
                    localizations: [
                        {
                            language: english,
                            translationStatus: TranslationStatus.Relevant,
                            authorName: 'Olena Petrenko',
                            text: 'Great rehabilitation center!',
                        },
                    ],
                },
                language: english,
            });

            expect(screen.getByText('Olena Petrenko')).toBeInTheDocument();
            expect(screen.getByText('Great rehabilitation center!')).toBeInTheDocument();
        });

        it('translates only the video title and keeps the link', () => {
            renderComponent({
                item: {
                    ...mockVideoItem,
                    localizations: [
                        { language: english, translationStatus: TranslationStatus.Relevant, title: 'Video review' },
                    ],
                },
                language: english,
            });

            expect(screen.getByText('Video review')).toBeInTheDocument();
            expect(screen.getByRole('link', { name: mockVideoItem.link })).toBeInTheDocument();
        });

        it('renders a red (missing) EN badge when there is no translation', () => {
            renderComponent({ item: mockHistoryItem, translationLanguages: [english] });

            const badge = screen.getByText('EN');
            expect(badge).toHaveClass(badgeStyles.badge);
            expect(badge).not.toHaveClass(badgeStyles.relevant);
            expect(badge).not.toHaveClass(badgeStyles.outdated);
        });

        it('renders a green (relevant) EN badge when the translation is up to date', () => {
            renderComponent({ item: translatedHistory, translationLanguages: [english] });

            expect(screen.getByText('EN')).toHaveClass(badgeStyles.relevant);
        });

        it('renders an orange (outdated) EN badge when the translation is outdated', () => {
            renderComponent({
                item: {
                    ...translatedHistory,
                    localizations: [
                        { ...translatedHistory.localizations[0], translationStatus: TranslationStatus.Outdated },
                    ],
                },
                translationLanguages: [english],
            });

            expect(screen.getByText('EN')).toHaveClass(badgeStyles.outdated);
        });
    });

    it('does not throw when clicking buttons without onEdit, onDelete or onTranslate handlers provided', () => {
        render(<FeedbackComponent item={mockHistoryItem} />);

        const translateBtn = screen.getByRole('button', { name: FEEDBACK_TEXT.ACTIONS.TRANSLATE });
        const editBtn = screen.getByRole('button', { name: FEEDBACK_TEXT.ACTIONS.EDIT });
        const deleteBtn = screen.getByRole('button', { name: FEEDBACK_TEXT.ACTIONS.DELETE });

        expect(() => {
            fireEvent.click(translateBtn);
            fireEvent.click(editBtn);
            fireEvent.click(deleteBtn);
        }).not.toThrow();
    });
});
