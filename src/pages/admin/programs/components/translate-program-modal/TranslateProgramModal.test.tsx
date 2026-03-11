import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TranslateProgramModal } from './TranslateProgramModal';
import { HippotherapyProgram } from '@/types/admin/programs';
import { useTranslateProgram } from '@/hooks/admin/use-translate-program/useTranslateProgram';
import { LocalizationLanguage } from '@/types/common/language';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { ModalMode } from '@/types/admin/common';
import { DEFAULT_LOCALE } from '@/const/common/locales';

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
                    onValidationChange?.(mockFormIsValid);
                    onDirtyChange?.(mockFormIsDirty);
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

    it('uses add mode and add title when localization is absent', () => {
        renderModal({
            programToTranslate: TEST_DATA.program,
            translatedLanguages: [TEST_DATA.language],
        });

        expect(screen.getByText(COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION)).toBeInTheDocument();
        expect(mockUseTranslateProgram).toHaveBeenCalledWith(
            expect.objectContaining({
                mode: ModalMode.Add,
                language: expect.objectContaining({ code: 'en' }),
            }),
        );
    });

    it('uses edit mode and edit title when localization exists', () => {
        renderModal({
            programToTranslate: TEST_DATA.programWithLocalization,
            translatedLanguages: [TEST_DATA.language],
        });

        expect(screen.getByText(COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.UPDATE_TRANSLATION)).toBeInTheDocument();
        expect(mockUseTranslateProgram).toHaveBeenCalledWith(
            expect.objectContaining({
                mode: ModalMode.Edit,
                language: expect.objectContaining({ code: 'en' }),
            }),
        );
    });

    it('disables save button when form is invalid', () => {
        mockFormIsValid = false;

        renderModal();

        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_TRANSLATION })).toBeDisabled();
    });

    it('disables save button when form is not dirty', () => {
        mockFormIsDirty = false;

        renderModal();

        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_TRANSLATION })).toBeDisabled();
    });

    it('opens exit confirmation on close when form is dirty', async () => {
        renderModal();

        fireEvent.click(screen.getByLabelText('Close modal'));

        await waitFor(() => {
            expect(screen.getByText(COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE)).toBeInTheDocument();
        });
    });

    it('closes immediately when form is not dirty', () => {
        const onClose = jest.fn();
        mockFormIsDirty = false;

        renderModal({ onClose });

        fireEvent.click(screen.getByLabelText('Close modal'));

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(
            screen.queryByText(COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE),
        ).not.toBeInTheDocument();
    });

    it('handles exit confirmation actions', async () => {
        const onClose = jest.fn();

        renderModal({ onClose });

        fireEvent.click(screen.getByLabelText('Close modal'));

        await waitFor(() => {
            expect(screen.getByText(COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.NO }));
        expect(onClose).not.toHaveBeenCalled();

        fireEvent.click(screen.getByLabelText('Close modal'));
        await waitFor(() => {
            expect(screen.getByText(COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE)).toBeInTheDocument();
        });

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES }));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('selects non-default language when languages arrive after initial empty list', async () => {
        const english = { id: 2, code: 'en', name: 'English' } as LocalizationLanguage;
        const ukrainian = { id: 1, code: DEFAULT_LOCALE, name: 'Українська' } as LocalizationLanguage;

        const { rerender } = render(
            <TranslateProgramModal
                isOpen={true}
                onClose={jest.fn()}
                programToTranslate={TEST_DATA.program}
                onTranslateProgram={jest.fn()}
                translatedLanguages={[]}
            />,
        );

        rerender(
            <TranslateProgramModal
                isOpen={true}
                onClose={jest.fn()}
                programToTranslate={TEST_DATA.program}
                onTranslateProgram={jest.fn()}
                translatedLanguages={[ukrainian, english]}
            />,
        );

        await waitFor(() => {
            expect(mockUseTranslateProgram).toHaveBeenLastCalledWith(
                expect.objectContaining({
                    language: expect.objectContaining({ code: 'en' }),
                }),
            );
        });
    });

    it('renders error message and disables actions while submitting', () => {
        mockUseTranslateProgram.mockReturnValue({
            translateProgram: mockTranslateProgram,
            isSubmitting: true,
            error: 'Hook error text',
            clearError: jest.fn(),
        });

        renderModal();

        expect(screen.getByText('Hook error text')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.SAVE_TRANSLATION })).toBeDisabled();
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.GENERATE_TRANSLATION })).toBeDisabled();
    });

    it('handles generate button click without submitting form', () => {
        renderModal();

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.GENERATE_TRANSLATION }));

        expect(mockTranslateProgram).not.toHaveBeenCalled();
    });

    it('maps localized section contents into initialData for selected language', () => {
        const programWithSections = {
            ...TEST_DATA.program,
            previewImage: { url: 'https://example.com/preview.jpg' },
            backgroundImage: { url: 'https://example.com/bg.jpg' },
            sections: [
                {
                    id: 701,
                    template: 1,
                    contents: [
                        {
                            id: 801,
                            localizations: [
                                {
                                    localizationInfoDto: { id: 2 },
                                    title: 'Localized title',
                                    description: 'Localized description',
                                    author: 'Localized author',
                                    question: 'Localized question',
                                    answer: 'Localized answer',
                                },
                            ],
                        },
                    ],
                },
            ],
        } as any;

        renderModal({
            programToTranslate: programWithSections,
            translatedLanguages: [TEST_DATA.language],
        });

        const attr = screen.getByTestId('translate-form').getAttribute('data-initial');
        expect(attr).toBeTruthy();

        const parsed = JSON.parse(attr!);
        expect(parsed.__previewImage).toMatchObject({ url: 'https://example.com/preview.jpg' });
        expect(parsed.__backgroundImage).toMatchObject({ url: 'https://example.com/bg.jpg' });
        expect(parsed.sections).toHaveLength(1);
        expect(parsed.sections[0]).toMatchObject({ entityId: 701 });
        expect(parsed.sections[0].contents[0]).toMatchObject({
            entityId: 801,
            languageId: 2,
            title: 'Localized title',
            description: 'Localized description',
            author: 'Localized author',
            question: 'Localized question',
            answer: 'Localized answer',
        });
    });
});
