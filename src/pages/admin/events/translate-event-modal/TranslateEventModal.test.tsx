import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TranslateEventModal, TranslateEventModalProps } from './TranslateEventModal';
import { EventItemDto } from '@/types/admin/events';
import { VisibilityStatus } from '@/types/admin/common';
import { useTranslateEvent } from '@/hooks/admin/use-translate-event/useTranslateEvent';

jest.mock('@/const/common/locales', () => ({
    DEFAULT_LOCALE: 'uk',
}));

jest.mock('@/components/admin/localization-modal/LocalizationModal', () => ({
    LocalizationModal: ({ isOpen, onClose, onSave, children, title, isSubmitting, isFormValid, isDirty }: any) => {
        if (!isOpen) return null;
        return (
            <div data-testid="localization-modal">
                <h2>{title}</h2>
                <button data-testid="modal-close" onClick={onClose}>
                    Close
                </button>
                <button data-testid="modal-save" onClick={onSave} disabled={isSubmitting || !isFormValid}>
                    Save
                </button>
                <div data-testid="form-status">
                    Dirty: {String(isDirty)}, Valid: {String(isFormValid)}
                </div>
                {children}
            </div>
        );
    },
}));

jest.mock('@/components/admin/translation-controls/TranslationControls', () => ({
    TranslationControls: ({ selectedLanguage, onLanguageChange, languages }: any) => (
        <div data-testid="translation-controls">
            <span data-testid="selected-lang">{selectedLanguage?.code}</span>
            <button data-testid="change-lang-btn" onClick={() => onLanguageChange(languages[0])}>
                Change Language
            </button>
        </div>
    ),
}));

const mockFormSubmit = jest.fn();
const mockIsValid = jest.fn();
const mockIsDirty = jest.fn();
const mockTranslateEvent = jest.fn();

jest.mock('@/hooks/admin/use-translate-event/useTranslateEvent', () => ({
    useTranslateEvent: jest.fn(() => ({
        translateEvent: mockTranslateEvent,
        isSubmitting: false,
        error: '',
        clearError: jest.fn(),
    })),
}));

const mockUseTranslateEvent = jest.mocked(useTranslateEvent);

jest.mock('@/pages/admin/events/translate-event-form/TranslateEventForm', () => {
    const React = require('react');
    return {
        TranslateEventForm: React.forwardRef((props: any, ref: any) => {
            React.useImperativeHandle(ref, () => ({
                submit: () => {
                    mockFormSubmit();
                    props.onSubmit({ title: 'Mock Title', description: 'Mock Desc', additionalDescription: '' });
                },
                isValid: mockIsValid,
                isDirty: mockIsDirty,
            }));

            return (
                <div data-testid="translate-event-form">
                    <button data-testid="make-valid" onClick={() => props.onValidationChange(true)}>
                        Valid
                    </button>
                    <button data-testid="make-dirty" onClick={() => props.onDirtyChange(true)}>
                        Dirty
                    </button>
                </div>
            );
        }),
    };
});

describe('TranslateEventModal', () => {
    const mockOnClose = jest.fn();

    const mockEvent: EventItemDto = {
        id: 101,
        title: 'Original Event',
        description: 'Original Description',
        publishedAt: '2024-01-15T00:00:00.000Z',
        status: VisibilityStatus.Published,
    } as EventItemDto;

    const mockLanguages = [
        { id: 1, code: 'uk', name: 'Ukrainian' },
        { id: 2, code: 'en', name: 'English' },
    ] as any[];

    const defaultProps: TranslateEventModalProps = {
        isOpen: true,
        onClose: mockOnClose,
        eventToTranslate: mockEvent,
        translatedLanguages: mockLanguages,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockIsValid.mockReturnValue(true);
        mockIsDirty.mockReturnValue(false);
        mockUseTranslateEvent.mockReturnValue({
            translateEvent: mockTranslateEvent,
            isSubmitting: false,
            error: '',
            clearError: jest.fn(),
        });
    });

    it('returns null and does not render when eventToTranslate is null', () => {
        render(<TranslateEventModal {...defaultProps} eventToTranslate={null} />);
        expect(screen.queryByTestId('localization-modal')).not.toBeInTheDocument();
    });

    it('renders the modal when isOpen is true and event is provided', () => {
        render(<TranslateEventModal {...defaultProps} />);

        expect(screen.getByTestId('localization-modal')).toBeInTheDocument();
        expect(screen.getByText('Додати переклад')).toBeInTheDocument();
        expect(screen.getByTestId('translate-event-form')).toBeInTheDocument();
        expect(screen.getByTestId('translation-controls')).toBeInTheDocument();
    });

    it('initializes with a non-default locale (en)', () => {
        render(<TranslateEventModal {...defaultProps} />);

        expect(screen.getByTestId('selected-lang')).toHaveTextContent('en');
    });

    it('updates language when TranslationControls changes it', () => {
        render(<TranslateEventModal {...defaultProps} />);

        expect(screen.getByTestId('selected-lang')).toHaveTextContent('en');

        fireEvent.click(screen.getByTestId('change-lang-btn'));

        expect(screen.getByTestId('selected-lang')).toHaveTextContent('uk');
    });

    it('updates form valid and dirty states from the form component', () => {
        render(<TranslateEventModal {...defaultProps} />);

        expect(screen.getByTestId('form-status')).toHaveTextContent('Dirty: false, Valid: false');

        fireEvent.click(screen.getByTestId('make-valid'));
        fireEvent.click(screen.getByTestId('make-dirty'));

        expect(screen.getByTestId('form-status')).toHaveTextContent('Dirty: true, Valid: true');
    });

    it('submits form, calls onTranslateEvent and onClose on success', async () => {
        const mockOnTranslateEvent = jest.fn();
        mockTranslateEvent.mockImplementation(async () => {
            const hookCall = mockUseTranslateEvent.mock.calls[mockUseTranslateEvent.mock.calls.length - 1][0];
            hookCall.onSuccess(mockEvent);
        });

        render(<TranslateEventModal {...defaultProps} onTranslateEvent={mockOnTranslateEvent} />);

        fireEvent.click(screen.getByTestId('make-valid'));
        fireEvent.click(screen.getByTestId('modal-save'));

        await waitFor(() => {
            expect(mockFormSubmit).toHaveBeenCalled();
            expect(mockTranslateEvent).toHaveBeenCalled();
            expect(mockOnTranslateEvent).toHaveBeenCalledWith(mockEvent);
            expect(mockOnClose).toHaveBeenCalled();
        });
    });

    it('renders error message when useTranslateEvent returns error', () => {
        mockUseTranslateEvent.mockReturnValue({
            translateEvent: mockTranslateEvent,
            isSubmitting: false,
            error: 'Mock Error',
            clearError: jest.fn(),
        });
        render(<TranslateEventModal {...defaultProps} />);
        expect(screen.getByText('Mock Error')).toBeInTheDocument();
    });

    it('renders edit mode title when event already has localization for the selected language', () => {
        const eventWithLoc: EventItemDto = {
            ...mockEvent,
            localizations: [
                {
                    language: { id: 2, code: 'en' },
                    title: 'Existing EN Title',
                    description: 'Existing EN Desc',
                    additionalDescription: 'Existing extra',
                    translationStatus: 1 as any,
                },
            ],
        };

        render(<TranslateEventModal {...defaultProps} eventToTranslate={eventWithLoc} />);

        expect(screen.getByText('Редагувати переклад')).toBeInTheDocument();
    });
});
