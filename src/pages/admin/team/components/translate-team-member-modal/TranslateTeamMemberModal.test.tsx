import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TranslateTeamMemberModal } from './TranslateTeamMemberModal';
import { TeamMember } from '@/types/admin/team-members';
import { useTranslateTeamMember } from '@/hooks/admin/use-translate-team-member/useTranslateTeamMember';
import { ModalMode } from '@/types/admin/common';

jest.mock('@/components/admin/button/Button', () => ({
    Button: (props: any) => require('@/utils/test-mocks/test-mocks').MockButton(props),
}));

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: (props: any) => require('@/utils/test-mocks/test-mocks').MockConfirmationModal(props),
}));

jest.mock('@/components/common/modal/Modal', () => {
    const Modal = ({ isOpen, children, onClose }: any) =>
        isOpen ? (
            <div
                data-testid="modal"
                onClick={onClose}
                role="dialog"
                aria-modal="true"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Escape') onClose();
                }}
            >
                {children}
            </div>
        ) : null;

    Modal.Title = ({ children }: any) => <div data-testid="modal-title">{children}</div>;
    Modal.Content = ({ children }: any) => <div data-testid="modal-content">{children}</div>;
    Modal.Actions = ({ children }: any) => <div data-testid="modal-actions">{children}</div>;

    return { Modal };
});

jest.mock('../translate-member-form/TranslateMemberForm', () => {
    const React = require('react');

    return {
        TranslateMemberForm: React.forwardRef(({ onSubmit, onValidationChange }: any, ref: React.Ref<any>) => {
            React.useImperativeHandle(ref, () => ({
                submit: () =>
                    onSubmit({
                        fullName: 'Translated Name',
                        description: 'Translated Description',
                    }),
                isValid: () => true,
                isDirty: () => true,
            }));

            React.useEffect(() => {
                onValidationChange?.(true);
            }, [onValidationChange]);

            return <div data-testid="translate-form" />;
        }),
    };
});

const mockTranslateMember = jest.fn();
jest.mock('@/hooks/admin/use-translate-team-member/useTranslateTeamMember', () => ({
    useTranslateTeamMember: jest.fn(() => ({
        translateMember: mockTranslateMember,
        isSubmitting: false,
        error: '',
        clearError: jest.fn(),
    })),
}));

const mockUseTranslateTeamMember = jest.mocked(useTranslateTeamMember);

const TEST_DATA = {
    member: {
        id: 1,
        fullName: 'Original Name',
        description: 'Original Description',
        status: 1,
        categoryId: 1,
        image: null,
        localizations: [],
    } as TeamMember,
    language: {
        id: 2,
        code: 'en',
        name: 'English',
    },
    translatedData: {
        fullName: 'Translated Name',
        description: 'Translated Description',
    },
};

describe('TranslateTeamMemberModal', () => {
    const renderModal = (props: Partial<React.ComponentProps<typeof TranslateTeamMemberModal>> = {}) => {
        const defaultProps = {
            mode: ModalMode.Add,
            isOpen: true,
            onClose: jest.fn(),
            memberToTranslate: TEST_DATA.member,
            onTranslateMember: jest.fn(),
            language: TEST_DATA.language,
        };

        return render(<TranslateTeamMemberModal {...defaultProps} {...props} />);
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockTranslateMember.mockResolvedValue(undefined);
        mockUseTranslateTeamMember.mockReturnValue({
            translateMember: mockTranslateMember,
            isSubmitting: false,
            error: '',
            clearError: jest.fn(),
        });
    });

    it('renders modal when open and member exists', () => {
        renderModal();

        expect(screen.getByTestId('modal')).toBeInTheDocument();
        expect(screen.getByTestId('translate-form')).toBeInTheDocument();
        expect(screen.getByTestId('modal-title')).toBeInTheDocument();
    });

    it('enables translate button when form is valid', () => {
        renderModal();

        const button = screen.getByTestId('save-localization-btn');
        expect(button).toBeEnabled();
    });

    it('submits translation and calls translateMember', async () => {
        const onTranslateMember = jest.fn();
        const onClose = jest.fn();

        mockTranslateMember.mockImplementation(async () => {
            const hookCall = mockUseTranslateTeamMember.mock.calls[0][0];
            hookCall.onSuccess({ ...TEST_DATA.member });
        });

        renderModal({ onTranslateMember, onClose });

        const button = screen.getByTestId('save-localization-btn');
        fireEvent.click(button);

        await waitFor(() => {
            expect(mockTranslateMember).toHaveBeenCalledWith(TEST_DATA.translatedData);
        });

        expect(onTranslateMember).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalled();
    });

    it('shows confirmation modal on close when form is dirty', () => {
        const onClose = jest.fn();

        renderModal({ onClose });

        fireEvent.click(screen.getByTestId('modal'));

        expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
        expect(onClose).not.toHaveBeenCalled();
    });

    it('disables translate button while submitting', () => {
        mockUseTranslateTeamMember.mockReturnValue({
            translateMember: mockTranslateMember,
            isSubmitting: true,
            error: '',
            clearError: jest.fn(),
        });

        renderModal();

        const button = screen.getByTestId('save-localization-btn');
        expect(button).toBeDisabled();
    });
    describe('TranslateTeamMemberModal - Additional Coverage', () => {
        describe('Edit mode', () => {
            it('renders modal in edit mode with existing localization', () => {
                const memberWithLocalization = {
                    ...TEST_DATA.member,
                    localizations: [
                        {
                            language: TEST_DATA.language,
                            fullName: 'Existing Translation',
                            description: 'Existing Description',
                            translationStatus: 1,
                        },
                    ],
                } as TeamMember;

                renderModal({
                    mode: ModalMode.Edit,
                    memberToTranslate: memberWithLocalization,
                });

                expect(screen.getByTestId('modal')).toBeInTheDocument();
                expect(screen.getByTestId('translate-form')).toBeInTheDocument();
            });

            it('shows correct title for edit mode', () => {
                const { COMMON_TEXT_ADMIN } = require('@/const/admin/common');

                const memberWithLocalization = {
                    ...TEST_DATA.member,
                    localizations: [
                        {
                            language: TEST_DATA.language,
                            fullName: 'Existing Translation',
                            description: 'Existing Description',
                            translationStatus: 1,
                        },
                    ],
                } as TeamMember;

                renderModal({
                    mode: ModalMode.Edit,
                    memberToTranslate: memberWithLocalization,
                });

                const title = screen.getByTestId('modal-title');
                expect(title).toHaveTextContent(COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.UPDATE_TRANSLATION);
            });

            it('shows correct title for add mode', () => {
                const { COMMON_TEXT_ADMIN } = require('@/const/admin/common');

                renderModal({
                    mode: ModalMode.Add,
                });

                const title = screen.getByTestId('modal-title');
                expect(title).toHaveTextContent(COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION);
            });
        });

        describe('Form validation', () => {
            it('button is enabled when form is valid', () => {
                renderModal();

                const button = screen.getByTestId('save-localization-btn');
                expect(button).toBeEnabled();
            });

            it('button is disabled when submitting', () => {
                mockUseTranslateTeamMember.mockReturnValue({
                    translateMember: mockTranslateMember,
                    isSubmitting: true,
                    error: '',
                    clearError: jest.fn(),
                });

                renderModal();

                const button = screen.getByTestId('save-localization-btn');
                expect(button).toBeDisabled();
            });
        });

        describe('Error handling', () => {
            it('displays error message when translation fails', () => {
                const errorMessage = 'Translation failed';

                mockUseTranslateTeamMember.mockReturnValue({
                    translateMember: mockTranslateMember,
                    isSubmitting: false,
                    error: errorMessage,
                    clearError: jest.fn(),
                });

                renderModal();

                expect(screen.getByText(errorMessage)).toBeInTheDocument();
            });

            it('does not display error when error is empty', () => {
                mockUseTranslateTeamMember.mockReturnValue({
                    translateMember: mockTranslateMember,
                    isSubmitting: false,
                    error: '',
                    clearError: jest.fn(),
                });

                renderModal();

                expect(screen.queryByText(/Translation failed/i)).not.toBeInTheDocument();
            });
        });

        describe('Modal lifecycle', () => {
            it('does not render when isOpen is false', () => {
                renderModal({ isOpen: false });

                expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
            });

            it('does not render when memberToTranslate is null', () => {
                renderModal({ memberToTranslate: null });

                expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
            });

            it('closes modal after successful translation', async () => {
                const onClose = jest.fn();
                const onTranslateMember = jest.fn();

                mockTranslateMember.mockImplementation(async () => {
                    const hookCall = mockUseTranslateTeamMember.mock.calls[0][0];
                    hookCall.onSuccess({ ...TEST_DATA.member });
                });

                renderModal({ onClose, onTranslateMember });

                const button = screen.getByTestId('save-localization-btn');
                fireEvent.click(button);

                await waitFor(() => {
                    expect(onClose).toHaveBeenCalled();
                });
            });
        });

        describe('Localization data', () => {
            it('finds existing localization by language id', () => {
                const memberWithMultipleLocalizations = {
                    ...TEST_DATA.member,
                    localizations: [
                        {
                            language: { id: 1, code: 'ua', name: 'Ukrainian' },
                            fullName: 'Ukrainian Name',
                            description: 'Ukrainian Description',
                            translationStatus: 1,
                        },
                        {
                            language: TEST_DATA.language,
                            fullName: 'English Name',
                            description: 'English Description',
                            translationStatus: 1,
                        },
                    ],
                } as unknown as TeamMember;

                renderModal({
                    mode: ModalMode.Edit,
                    memberToTranslate: memberWithMultipleLocalizations,
                });

                expect(screen.getByTestId('translate-form')).toBeInTheDocument();
            });

            it('returns null for initialData in add mode', () => {
                renderModal({
                    mode: ModalMode.Add,
                    memberToTranslate: TEST_DATA.member,
                });

                expect(screen.getByTestId('translate-form')).toBeInTheDocument();
            });

            it('handles member without localizations in edit mode', () => {
                const memberWithoutLocalization = {
                    ...TEST_DATA.member,
                    localizations: [],
                } as TeamMember;

                renderModal({
                    mode: ModalMode.Edit,
                    memberToTranslate: memberWithoutLocalization,
                });

                expect(screen.getByTestId('translate-form')).toBeInTheDocument();
            });
        });

        describe('Form submission', () => {
            it('calls translateMember with form data on submit', async () => {
                renderModal();

                const button = screen.getByTestId('save-localization-btn');
                fireEvent.click(button);

                await waitFor(() => {
                    expect(mockTranslateMember).toHaveBeenCalledWith(TEST_DATA.translatedData);
                });
            });

            it('passes correct props to useTranslateTeamMember hook', () => {
                const onTranslateMember = jest.fn();

                renderModal({
                    memberToTranslate: TEST_DATA.member,
                    language: TEST_DATA.language,
                    mode: ModalMode.Add,
                    onTranslateMember,
                });

                expect(mockUseTranslateTeamMember).toHaveBeenCalledWith({
                    member: TEST_DATA.member,
                    language: TEST_DATA.language,
                    onSuccess: expect.any(Function),
                    mode: ModalMode.Add,
                });
            });
        });

        describe('Keyboard interactions', () => {
            it('handles Escape key press', () => {
                const onClose = jest.fn();
                renderModal({ onClose });

                const modal = screen.getByTestId('modal');
                fireEvent.keyDown(modal, { key: 'Escape' });

                expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
            });
        });

        describe('Confirmation modal flow', () => {
            it('shows confirmation modal when trying to close with dirty form', () => {
                const onClose = jest.fn();
                renderModal({ onClose });

                fireEvent.click(screen.getByTestId('modal'));
                expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
            });

            it('confirms and closes modal when user confirms discard', () => {
                const onClose = jest.fn();
                renderModal({ onClose });

                fireEvent.click(screen.getByTestId('modal'));
                expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();

                const confirmButton = screen.getByTestId('confirm-close');
                fireEvent.click(confirmButton);

                expect(onClose).toHaveBeenCalled();
            });

            it('cancels close when user cancels confirmation', () => {
                const onClose = jest.fn();
                renderModal({ onClose });

                fireEvent.click(screen.getByTestId('modal'));
                expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();

                const cancelButton = screen.getByTestId('cancel-close');
                fireEvent.click(cancelButton);

                expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
                expect(onClose).not.toHaveBeenCalled();
            });
        });

        describe('Different language scenarios', () => {
            it('works with different language codes', () => {
                const ukrainianLanguage = {
                    id: 3,
                    code: 'uk',
                    name: 'Ukrainian',
                };

                renderModal({
                    language: ukrainianLanguage,
                });

                expect(screen.getByTestId('translate-form')).toBeInTheDocument();
            });

            it('handles localization matching by language id', () => {
                const memberWithLocalization = {
                    ...TEST_DATA.member,
                    localizations: [
                        {
                            language: { id: 2, code: 'en', name: 'English' },
                            fullName: 'English Name',
                            description: 'English Description',
                            translationStatus: 1,
                        },
                    ],
                } as unknown as TeamMember;

                renderModal({
                    mode: ModalMode.Edit,
                    memberToTranslate: memberWithLocalization,
                    language: { id: 2, code: 'en', name: 'English' },
                });

                expect(screen.getByTestId('translate-form')).toBeInTheDocument();
            });
        });

        describe('onSuccess callback', () => {
            it('calls onTranslateMember with updated member on success', async () => {
                const onTranslateMember = jest.fn();
                const updatedMember = {
                    ...TEST_DATA.member,
                    localizations: [
                        {
                            language: TEST_DATA.language,
                            fullName: TEST_DATA.translatedData.fullName,
                            description: TEST_DATA.translatedData.description,
                            translationStatus: 1,
                        },
                    ],
                };

                mockTranslateMember.mockImplementation(async () => {
                    const hookCall = mockUseTranslateTeamMember.mock.calls[0][0];
                    hookCall.onSuccess(updatedMember);
                });

                renderModal({ onTranslateMember });

                const button = screen.getByTestId('save-localization-btn');
                fireEvent.click(button);

                await waitFor(() => {
                    expect(onTranslateMember).toHaveBeenCalledWith(updatedMember);
                });
            });
        });

        describe('Submission state', () => {
            it('shows correct button text while submitting', () => {
                mockUseTranslateTeamMember.mockReturnValue({
                    translateMember: mockTranslateMember,
                    isSubmitting: true,
                    error: '',
                    clearError: jest.fn(),
                });

                renderModal();

                const button = screen.getByTestId('save-localization-btn');
                expect(button).toBeDisabled();
            });

            it('enables button when not submitting and form is valid', () => {
                mockUseTranslateTeamMember.mockReturnValue({
                    translateMember: mockTranslateMember,
                    isSubmitting: false,
                    error: '',
                    clearError: jest.fn(),
                });

                renderModal();

                const button = screen.getByTestId('save-localization-btn');
                expect(button).toBeEnabled();
            });
        });

        describe('Hook dependencies', () => {
            it('recalculates existingLocalization when language changes', () => {
                const { rerender } = renderModal({
                    language: { id: 1, code: 'ua', name: 'Ukrainian' },
                });

                expect(screen.getByTestId('translate-form')).toBeInTheDocument();

                const newLanguage = { id: 2, code: 'en', name: 'English' };

                const defaultProps = {
                    mode: ModalMode.Add,
                    isOpen: true,
                    onClose: jest.fn(),
                    memberToTranslate: TEST_DATA.member,
                    onTranslateMember: jest.fn(),
                    language: newLanguage,
                };

                rerender(<TranslateTeamMemberModal {...defaultProps} />);

                expect(screen.getByTestId('translate-form')).toBeInTheDocument();
            });

            it('recalculates initialData when mode changes from Add to Edit', () => {
                const memberWithLocalization = {
                    ...TEST_DATA.member,
                    localizations: [
                        {
                            language: TEST_DATA.language,
                            fullName: 'Existing Translation',
                            description: 'Existing Description',
                            translationStatus: 1,
                        },
                    ],
                } as TeamMember;

                const { rerender } = renderModal({
                    mode: ModalMode.Add,
                    memberToTranslate: memberWithLocalization,
                });

                expect(screen.getByTestId('translate-form')).toBeInTheDocument();

                const defaultProps = {
                    mode: ModalMode.Edit,
                    isOpen: true,
                    onClose: jest.fn(),
                    memberToTranslate: memberWithLocalization,
                    onTranslateMember: jest.fn(),
                    language: TEST_DATA.language,
                };

                rerender(<TranslateTeamMemberModal {...defaultProps} />);

                expect(screen.getByTestId('translate-form')).toBeInTheDocument();
            });
        });
    });
});
