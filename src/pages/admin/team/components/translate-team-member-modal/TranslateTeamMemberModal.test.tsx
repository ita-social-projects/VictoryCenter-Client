import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TranslateTeamMemberModal } from './TranslateTeamMemberModal';
import { TeamMember } from '@/types/admin/team-members';
import { useTranslateTeamMember } from '@/hooks/admin/use-translate-team-member/useTranslateTeamMember';
import { ModalMode } from '@/types/admin/common';

jest.mock('@/components/admin/button/Button', () => ({
    Button: (props: any) => (
        <button {...props} data-testid={props['data-testid'] || 'button'}>
            {props.children}
        </button>
    ),
}));

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: ({ isOpen, onConfirm, onCancel }: any) =>
        isOpen ? (
            <div data-testid="confirmation-modal">
                <button data-testid="confirm-close" onClick={onConfirm}>
                    confirm
                </button>
                <button data-testid="cancel-close" onClick={onCancel}>
                    cancel
                </button>
            </div>
        ) : null,
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

const member: TeamMember = {
    id: 1,
    fullName: 'Original Name',
    description: 'Original Description',
    status: 1,
    categoryId: 1,
    image: null,
    localizations: [],
};

const language = {
    id: 2,
    code: 'en',
    name: 'English',
};

describe('TranslateTeamMemberModal', () => {
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
        render(
            <TranslateTeamMemberModal
                mode={ModalMode.Add}
                isOpen
                onClose={jest.fn()}
                memberToTranslate={member}
                onTranslateMember={jest.fn()}
                language={language}
            />,
        );

        expect(screen.getByTestId('modal')).toBeInTheDocument();
        expect(screen.getByTestId('translate-form')).toBeInTheDocument();
        expect(screen.getByTestId('modal-title')).toBeInTheDocument();
    });

    it('enables translate button when form is valid', () => {
        render(
            <TranslateTeamMemberModal
                mode={ModalMode.Add}
                isOpen
                onClose={jest.fn()}
                memberToTranslate={member}
                onTranslateMember={jest.fn()}
                language={language}
            />,
        );

        const button = screen.getByTestId('save-localization-btn');
        expect(button).toBeEnabled();
    });

    it('submits translation and calls translateMember', async () => {
        const onTranslateMember = jest.fn();
        const onClose = jest.fn();

        mockTranslateMember.mockImplementation(async () => {
            const hookCall = mockUseTranslateTeamMember.mock.calls[0][0];
            hookCall.onSuccess({ ...member });
        });

        render(
            <TranslateTeamMemberModal
                mode={ModalMode.Add}
                isOpen
                onClose={onClose}
                memberToTranslate={member}
                onTranslateMember={onTranslateMember}
                language={language}
            />,
        );

        const button = screen.getByTestId('save-localization-btn');
        fireEvent.click(button);

        await waitFor(() => {
            expect(mockTranslateMember).toHaveBeenCalledWith({
                fullName: 'Translated Name',
                description: 'Translated Description',
            });
        });

        expect(onTranslateMember).toHaveBeenCalledTimes(1);
        expect(onClose).toHaveBeenCalled();
    });

    it('shows confirmation modal on close when form is dirty', () => {
        const onClose = jest.fn();

        render(
            <TranslateTeamMemberModal
                mode={ModalMode.Add}
                isOpen
                onClose={onClose}
                memberToTranslate={member}
                onTranslateMember={jest.fn()}
                language={language}
            />,
        );

        fireEvent.click(screen.getByTestId('modal'));

        expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
        expect(onClose).not.toHaveBeenCalled();
    });

    it('disables translate button while submitting', async () => {
        mockUseTranslateTeamMember.mockReturnValue({
            translateMember: mockTranslateMember,
            isSubmitting: true,
            error: '',
            clearError: jest.fn(),
        });

        render(
            <TranslateTeamMemberModal
                mode={ModalMode.Add}
                isOpen
                onClose={jest.fn()}
                memberToTranslate={member}
                onTranslateMember={jest.fn()}
                language={language}
            />,
        );

        const button = screen.getByTestId('save-localization-btn');
        expect(button).toBeDisabled();
    });
});
