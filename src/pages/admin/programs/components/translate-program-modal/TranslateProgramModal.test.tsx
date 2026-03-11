import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TranslateProgramModal } from './TranslateProgramModal';
import { HippotherapyProgram } from '@/types/admin/programs';
import { useTranslateProgram } from '@/hooks/admin/use-translate-program/useTranslateProgram';
import { LocalizationLanguage } from '@/types/common/language';

let mockFormIsValid = true;
let mockFormIsDirty = true;

jest.mock('../translate-program-form/TranslateProgramForm', () => {
    const React = require('react');

    return {
        TranslateProgramForm: React.forwardRef(
            ({ onSubmit, onValidationChange, onDirtyChange, initialData }: any, ref: React.Ref<any>) => {
                React.useImperativeHandle(ref, () => ({
                    submit: (_status?: any) =>
                        onSubmit({
                            name: 'Translated',
                            description: '',
                            location: '',
                            participantsCount: '',
                            meetingCount: '',
                            sections: [],
                        }),
                    isValid: () => mockFormIsValid,
                    isDirty: () => mockFormIsDirty,
                }));

                React.useEffect(() => {
                    onValidationChange?.(true);
                    onDirtyChange?.(true);
                }, [onValidationChange, onDirtyChange]);

                return (
                    <div
                        data-testid="translate-form"
                        data-initial={initialData ? JSON.stringify(initialData) : undefined}
                    />
                );
            },
        ),
    };
});

const mockTranslateProgram = jest.fn();
jest.mock('@/hooks/admin/use-translate-program/useTranslateProgram', () => ({
    useTranslateProgram: jest.fn(() => ({
        translateProgram: mockTranslateProgram,
        isSubmitting: false,
        error: '',
        clearError: jest.fn(),
    })),
}));

const mockUseTranslateProgram = jest.mocked(useTranslateProgram);

const TEST_DATA = {
    program: {
        id: 1,
        name: 'Original',
        description: 'Orig',
        categories: [],
        status: 1 as any,
        previewImage: null,
        backgroundImage: null,
        location: '',
        participantsCount: '',
        meetingsCount: '',
        sections: [],
        slug: '',
        localizations: [],
    } as HippotherapyProgram,
    programWithLocalization: {
        id: 1,
        name: 'Original',
        description: 'Orig',
        categories: [],
        status: 1 as any,
        previewImage: null,
        backgroundImage: null,
        location: '',
        participantsCount: '',
        meetingsCount: '',
        sections: [],
        slug: '',
        localizations: [
            {
                name: 'Existing',
                description: 'X',
                location: '',
                participantsCount: '',
                meetingsCount: '',
                language: { id: 2, code: 'en' },
                translationStatus: 1,
            } as any,
        ],
    } as HippotherapyProgram,
    language: {
        id: 2,
        code: 'en',
        name: 'English',
    } as LocalizationLanguage,
    translatedLanguages: [
        {
            id: 2,
            code: 'en',
            name: 'English',
        },
        {
            id: 3,
            code: 'pl',
            name: 'Polish',
        },
    ] as LocalizationLanguage[],
};

describe('TranslateProgramModal', () => {
    const renderModal = (props: Partial<React.ComponentProps<typeof TranslateProgramModal>> = {}) => {
        const defaultProps = {
            isOpen: true,
            onClose: jest.fn(),
            programToTranslate: TEST_DATA.program,
            onTranslateProgram: jest.fn(),
            translatedLanguages: TEST_DATA.translatedLanguages,
        };
        return render(<TranslateProgramModal {...defaultProps} {...props} />);
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockFormIsValid = true;
        mockFormIsDirty = true;

        mockTranslateProgram.mockResolvedValue(undefined);
        mockUseTranslateProgram.mockReturnValue({
            translateProgram: mockTranslateProgram,
            isSubmitting: false,
            error: '',
            clearError: jest.fn(),
        });
    });

    it('renders modal when open and program exists', () => {
        renderModal();
        expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
        expect(screen.getByTestId('translate-form')).toBeInTheDocument();
    });

    it('does not render when programToTranslate is null', () => {
        renderModal({ programToTranslate: null });
        expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument();
    });

    it('passes correct initialData when in edit mode', () => {
        renderModal({
            programToTranslate: TEST_DATA.programWithLocalization,
            translatedLanguages: [TEST_DATA.language],
        });
        const form = screen.getByTestId('translate-form');
        const attr = form.getAttribute('data-initial');
        expect(attr).toBeTruthy();
        expect(JSON.parse(attr!)).toMatchObject({
            name: 'Existing',
            description: 'X',
            location: '',
            participantsCount: '',
            meetingCount: '',
            sections: [],
        });
    });

    it('submits translation when form valid', async () => {
        const onTranslateProgram = jest.fn();
        const onClose = jest.fn();
        mockTranslateProgram.mockImplementation(async () => {
            const hookCall = mockUseTranslateProgram.mock.calls[0][0];
            hookCall.onSuccess({ ...TEST_DATA.program });
        });

        renderModal({ onTranslateProgram, onClose });
        fireEvent.click(screen.getByRole('button', { name: 'Зберегти переклад' }));
        await waitFor(() => expect(mockTranslateProgram).toHaveBeenCalled());
        expect(onTranslateProgram).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
    });
});
