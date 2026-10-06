import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TranslateFeedbackVideoModal } from './TranslateFeedbackVideoModal';
import { FeedbackVideoDto } from '@/types/admin/feedback';
import { useTranslateFeedbackVideo } from '@/hooks/admin/use-translate-feedback-video/useTranslateFeedbackVideo';
import { VisibilityStatus } from '@/types/admin/common';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

jest.mock('@/components/admin/localization-modal/LocalizationModal', () => ({
    LocalizationModal: (props: unknown) => require('@/utils/test-mocks/test-mocks').MockLocalizationModal(props),
}));

jest.mock('../translate-feedback-video-form/TranslateFeedbackVideoForm', () => {
    const React = require('react');
    return {
        TranslateFeedbackVideoForm: React.forwardRef(
            ({ onSubmit, onValidationChange, onDirtyChange }: any, ref: React.Ref<any>) => {
                React.useImperativeHandle(ref, () => ({
                    submit: () => onSubmit({ title: 'Translated Title' }),
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

const mockTranslateVideo = jest.fn();
jest.mock('@/hooks/admin/use-translate-feedback-video/useTranslateFeedbackVideo', () => ({
    useTranslateFeedbackVideo: jest.fn(() => ({
        translateVideo: mockTranslateVideo,
        isSubmitting: false,
        error: '',
        clearError: jest.fn(),
    })),
}));

const mockUseTranslateFeedbackVideo = jest.mocked(useTranslateFeedbackVideo);

const TEST_DATA = {
    video: {
        id: 1,
        title: 'Original Title',
        link: 'https://youtube.com/watch?v=1',
        status: VisibilityStatus.Published,
        priority: 0,
        localizations: [],
    } as FeedbackVideoDto,
    translatedLanguages: [{ id: 2, code: 'en', name: 'English' }],
    translatedData: { title: 'Translated Title' },
};

describe('TranslateFeedbackVideoModal', () => {
    const renderModal = (props: Partial<React.ComponentProps<typeof TranslateFeedbackVideoModal>> = {}) => {
        const defaultProps = {
            isOpen: true,
            onClose: jest.fn(),
            videoToTranslate: TEST_DATA.video,
            onTranslateVideo: jest.fn(),
            translatedLanguages: TEST_DATA.translatedLanguages,
        };

        return render(<TranslateFeedbackVideoModal {...defaultProps} {...props} />);
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockTranslateVideo.mockResolvedValue(undefined);
        mockUseTranslateFeedbackVideo.mockReturnValue({
            translateVideo: mockTranslateVideo,
            isSubmitting: false,
            error: '',
            clearError: jest.fn(),
        });
    });

    it('renders modal when open and video exists', () => {
        renderModal();

        expect(screen.getByTestId('modal')).toBeInTheDocument();
        expect(screen.getByTestId('translate-form')).toBeInTheDocument();
    });

    it('does not render when videoToTranslate is null', () => {
        renderModal({ videoToTranslate: null });

        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('shows Add-translation title by default', () => {
        renderModal();

        expect(screen.getByTestId('modal-title')).toHaveTextContent(
            COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION,
        );
    });

    it('shows Update-translation title when a localization already exists', () => {
        const videoWithLocalization: FeedbackVideoDto = {
            ...TEST_DATA.video,
            localizations: [
                {
                    language: TEST_DATA.translatedLanguages[0],
                    title: 'Existing',
                    translationStatus: 1,
                },
            ],
        };

        renderModal({ videoToTranslate: videoWithLocalization });

        expect(screen.getByTestId('modal-title')).toHaveTextContent(
            COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.UPDATE_TRANSLATION,
        );
    });

    it('submits translation and calls onTranslateVideo then closes', async () => {
        const onTranslateVideo = jest.fn();
        const onClose = jest.fn();

        mockTranslateVideo.mockImplementation(async () => {
            const hookCall = mockUseTranslateFeedbackVideo.mock.calls[0][0];
            hookCall.onSuccess({ ...TEST_DATA.video });
        });

        renderModal({ onTranslateVideo, onClose });

        fireEvent.click(screen.getByTestId('save-localization-btn'));

        await waitFor(() => {
            expect(mockTranslateVideo).toHaveBeenCalledWith(TEST_DATA.translatedData);
        });

        expect(onTranslateVideo).toHaveBeenCalledTimes(1);
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
        mockUseTranslateFeedbackVideo.mockReturnValue({
            translateVideo: mockTranslateVideo,
            isSubmitting: true,
            error: '',
            clearError: jest.fn(),
        });

        renderModal();

        expect(screen.getByTestId('save-localization-btn')).toBeDisabled();
    });

    it('displays error message when translation fails', () => {
        mockUseTranslateFeedbackVideo.mockReturnValue({
            translateVideo: mockTranslateVideo,
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
            <TranslateFeedbackVideoModal
                isOpen
                onClose={jest.fn()}
                videoToTranslate={TEST_DATA.video}
                onTranslateVideo={jest.fn()}
                translatedLanguages={TEST_DATA.translatedLanguages}
            />,
        );

        expect(screen.getByTestId('translate-form')).toBeInTheDocument();
    });
});
