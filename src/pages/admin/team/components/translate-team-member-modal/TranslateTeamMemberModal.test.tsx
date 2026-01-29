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
});
