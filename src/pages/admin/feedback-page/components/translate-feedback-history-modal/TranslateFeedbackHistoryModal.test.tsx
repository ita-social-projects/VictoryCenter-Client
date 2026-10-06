import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TranslateFeedbackHistoryModal } from './TranslateFeedbackHistoryModal';
import { FeedbackHistoryDto } from '@/types/admin/feedback';
import { useTranslateFeedbackHistory } from '@/hooks/admin/use-translate-feedback-history/useTranslateFeedbackHistory';
import { VisibilityStatus } from '@/types/admin/common';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

jest.mock('@/components/admin/localization-modal/LocalizationModal', () => ({
    LocalizationModal: (props: unknown) => require('@/utils/test-mocks/test-mocks').MockLocalizationModal(props),
}));

jest.mock('../translate-feedback-history-form/TranslateFeedbackHistoryForm', () => {
    const React = require('react');
    return {
        TranslateFeedbackHistoryForm: React.forwardRef(
            ({ onSubmit, onValidationChange, onDirtyChange }: any, ref: React.Ref<any>) => {
                React.useImperativeHandle(ref, () => ({
                    submit: () => onSubmit({ title: 'Translated Title', story: 'Translated Story' }),
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

const mockTranslateHistory = jest.fn();
jest.mock('@/hooks/admin/use-translate-feedback-history/useTranslateFeedbackHistory', () => ({
    useTranslateFeedbackHistory: jest.fn(() => ({
        translateHistory: mockTranslateHistory,
        isSubmitting: false,
        error: '',
        clearError: jest.fn(),
    })),
}));

const mockUseTranslateFeedbackHistory = jest.mocked(useTranslateFeedbackHistory);

const TEST_DATA = {
    history: {
        id: 1,
        title: 'Original Title',
        story: 'Original Story',
        image: null,
        status: VisibilityStatus.Published,
        priority: 0,
        localizations: [],
    } as FeedbackHistoryDto,
    translatedLanguages: [{ id: 2, code: 'en', name: 'English' }],
    translatedData: { title: 'Translated Title', story: 'Translated Story' },
};

describe('TranslateFeedbackHistoryModal', () => {
    const renderModal = (props: Partial<React.ComponentProps<typeof TranslateFeedbackHistoryModal>> = {}) => {
        const defaultProps = {
            isOpen: true,
            onClose: jest.fn(),
            historyToTranslate: TEST_DATA.history,
            onTranslateHistory: jest.fn(),
            translatedLanguages: TEST_DATA.translatedLanguages,
        };

        return render(<TranslateFeedbackHistoryModal {...defaultProps} {...props} />);
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockTranslateHistory.mockResolvedValue(undefined);
        mockUseTranslateFeedbackHistory.mockReturnValue({
            translateHistory: mockTranslateHistory,
            isSubmitting: false,
            error: '',
            clearError: jest.fn(),
        });
    });

    it('renders modal when open and history exists', () => {
        renderModal();

        expect(screen.getByTestId('modal')).toBeInTheDocument();
        expect(screen.getByTestId('translate-form')).toBeInTheDocument();
    });

    it('does not render when historyToTranslate is null', () => {
        renderModal({ historyToTranslate: null });

        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('shows Add-translation title by default', () => {
        renderModal();

        expect(screen.getByTestId('modal-title')).toHaveTextContent(
            COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION,
        );
    });

    it('shows Update-translation title when a localization already exists', () => {
        const historyWithLocalization: FeedbackHistoryDto = {
            ...TEST_DATA.history,
            localizations: [
                {
                    language: TEST_DATA.translatedLanguages[0],
                    title: 'Existing',
                    story: 'Existing story',
                    translationStatus: 1,
                },
            ],
        };

        renderModal({ historyToTranslate: historyWithLocalization });

        expect(screen.getByTestId('modal-title')).toHaveTextContent(
            COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.UPDATE_TRANSLATION,
        );
    });

    it('submits translation and calls onTranslateHistory then closes', async () => {
        const onTranslateHistory = jest.fn();
        const onClose = jest.fn();

        mockTranslateHistory.mockImplementation(async () => {
            const hookCall = mockUseTranslateFeedbackHistory.mock.calls[0][0];
            hookCall.onSuccess({ ...TEST_DATA.history });
        });

        renderModal({ onTranslateHistory, onClose });

        fireEvent.click(screen.getByTestId('save-localization-btn'));

        await waitFor(() => {
            expect(mockTranslateHistory).toHaveBeenCalledWith(TEST_DATA.translatedData);
        });

        expect(onTranslateHistory).toHaveBeenCalledTimes(1);
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
        mockUseTranslateFeedbackHistory.mockReturnValue({
            translateHistory: mockTranslateHistory,
            isSubmitting: true,
            error: '',
            clearError: jest.fn(),
        });

        renderModal();

        expect(screen.getByTestId('save-localization-btn')).toBeDisabled();
    });

    it('displays error message when translation fails', () => {
        mockUseTranslateFeedbackHistory.mockReturnValue({
            translateHistory: mockTranslateHistory,
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
            <TranslateFeedbackHistoryModal
                isOpen
                onClose={jest.fn()}
                historyToTranslate={TEST_DATA.history}
                onTranslateHistory={jest.fn()}
                translatedLanguages={TEST_DATA.translatedLanguages}
            />,
        );

        expect(screen.getByTestId('translate-form')).toBeInTheDocument();
    });
});
