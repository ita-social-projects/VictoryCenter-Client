import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TranslateFeedbackReviewModal } from './TranslateFeedbackReviewModal';
import { FeedbackReviewDto } from '@/types/admin/feedback';
import { useTranslateFeedbackReview } from '@/hooks/admin/use-translate-feedback-review/useTranslateFeedbackReview';
import { VisibilityStatus } from '@/types/admin/common';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

jest.mock('@/components/admin/localization-modal/LocalizationModal', () => ({
    LocalizationModal: (props: unknown) => require('@/utils/test-mocks/test-mocks').MockLocalizationModal(props),
}));

jest.mock('../translate-feedback-review-form/TranslateFeedbackReviewForm', () => {
    const React = require('react');
    return {
        TranslateFeedbackReviewForm: React.forwardRef(
            ({ onSubmit, onValidationChange, onDirtyChange }: any, ref: React.Ref<any>) => {
                React.useImperativeHandle(ref, () => ({
                    submit: () => onSubmit({ authorName: 'Translated Name', text: 'Translated Text' }),
                    isValid: () => true,
                    isDirty: () => true,
                }));

                React.useEffect(() => {
                    onValidationChange?.(true);
                    onDirtyChange?.(true);
                }, [onValidationChange, onDirtyChange]);

                return <div data-testid="translate-form" />;
            },
        ),
    };
});

const mockTranslateReview = jest.fn();
jest.mock('@/hooks/admin/use-translate-feedback-review/useTranslateFeedbackReview', () => ({
    useTranslateFeedbackReview: jest.fn(() => ({
        translateReview: mockTranslateReview,
        isSubmitting: false,
        error: '',
        clearError: jest.fn(),
    })),
}));

const mockUseTranslateFeedbackReview = jest.mocked(useTranslateFeedbackReview);

const TEST_DATA = {
    review: {
        id: 1,
        authorName: 'Original Name',
        text: 'Original Text',
        status: VisibilityStatus.Published,
        priority: 0,
        localizations: [],
    } as FeedbackReviewDto,
    translatedLanguages: [{ id: 2, code: 'en', name: 'English' }],
    translatedData: { authorName: 'Translated Name', text: 'Translated Text' },
};

describe('TranslateFeedbackReviewModal', () => {
    const renderModal = (props: Partial<React.ComponentProps<typeof TranslateFeedbackReviewModal>> = {}) => {
        const defaultProps = {
            isOpen: true,
            onClose: jest.fn(),
            reviewToTranslate: TEST_DATA.review,
            onTranslateReview: jest.fn(),
            translatedLanguages: TEST_DATA.translatedLanguages,
        };

        return render(<TranslateFeedbackReviewModal {...defaultProps} {...props} />);
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockTranslateReview.mockResolvedValue(undefined);
        mockUseTranslateFeedbackReview.mockReturnValue({
            translateReview: mockTranslateReview,
            isSubmitting: false,
            error: '',
            clearError: jest.fn(),
        });
    });

    it('renders modal when open and review exists', () => {
        renderModal();

        expect(screen.getByTestId('modal')).toBeInTheDocument();
        expect(screen.getByTestId('translate-form')).toBeInTheDocument();
    });

    it('does not render when reviewToTranslate is null', () => {
        renderModal({ reviewToTranslate: null });

        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('shows Add-translation title by default', () => {
        renderModal();

        expect(screen.getByTestId('modal-title')).toHaveTextContent(
            COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION,
        );
    });

    it('shows Update-translation title when a localization already exists', () => {
        const reviewWithLocalization: FeedbackReviewDto = {
            ...TEST_DATA.review,
            localizations: [
                {
                    language: TEST_DATA.translatedLanguages[0],
                    authorName: 'Existing',
                    text: 'Existing text',
                    translationStatus: 1,
                },
            ],
        };

        renderModal({ reviewToTranslate: reviewWithLocalization });

        expect(screen.getByTestId('modal-title')).toHaveTextContent(
            COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.UPDATE_TRANSLATION,
        );
    });

    it('submits translation and calls onTranslateReview then closes', async () => {
        const onTranslateReview = jest.fn();
        const onClose = jest.fn();

        mockTranslateReview.mockImplementation(async () => {
            const hookCall = mockUseTranslateFeedbackReview.mock.calls[0][0];
            hookCall.onSuccess({ ...TEST_DATA.review });
        });

        renderModal({ onTranslateReview, onClose });

        fireEvent.click(screen.getByTestId('save-localization-btn'));

        await waitFor(() => {
            expect(mockTranslateReview).toHaveBeenCalledWith(TEST_DATA.translatedData);
        });

        expect(onTranslateReview).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalled();
    });

    it('shows confirmation modal on close when form is dirty', () => {
        const onClose = jest.fn();
        renderModal({ onClose });

        fireEvent.click(screen.getByTestId('modal'));

        expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
        expect(onClose).not.toHaveBeenCalled();
    });

    it('disables save button while submitting', () => {
        mockUseTranslateFeedbackReview.mockReturnValue({
            translateReview: mockTranslateReview,
            isSubmitting: true,
            error: '',
            clearError: jest.fn(),
        });

        renderModal();

        expect(screen.getByTestId('save-localization-btn')).toBeDisabled();
    });

    it('displays error message when translation fails', () => {
        mockUseTranslateFeedbackReview.mockReturnValue({
            translateReview: mockTranslateReview,
            isSubmitting: false,
            error: 'Translation failed',
            clearError: jest.fn(),
        });

        renderModal();

        expect(screen.getByText('Translation failed')).toBeInTheDocument();
    });

    it('sets default English language once translatedLanguages loads after initial render', () => {
        const { rerender } = renderModal({ translatedLanguages: [] });

        expect(screen.getByTestId('modal')).toBeInTheDocument();

        rerender(
            <TranslateFeedbackReviewModal
                isOpen
                onClose={jest.fn()}
                reviewToTranslate={TEST_DATA.review}
                onTranslateReview={jest.fn()}
                translatedLanguages={TEST_DATA.translatedLanguages}
            />,
        );

        expect(screen.getByTestId('translate-form')).toBeInTheDocument();
    });
});
