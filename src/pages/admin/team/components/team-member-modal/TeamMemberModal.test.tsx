import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { AxiosInstance } from 'axios';
import { TeamMember } from '../../../../../types/admin/team-members';
import { VisibilityStatus, ModalMode } from '../../../../../types/admin/common';
import { TeamMembersApi } from '../../../../../services/api/admin/team/team-members/team-members-api';
import { useAdminClient } from '../../../../../hooks/admin/use-admin-client/useAdminClient';
import { TeamMemberModal } from './TeamMemberModal';
import { TeamCategory } from '../../../../../types/admin/team-category';
import { ModalProps } from '../../../../../components/common/modal/Modal';
import { ButtonProps } from '../../../../../components/admin/button/Button';
import { ConfirmationModalProps } from '../../../../../components/admin/confirmation-modal/ConfirmationModal';

// Mock data-fetch API
jest.mock('../../../../../services/api/admin/team/team-members/team-members-api', () => ({
    TeamMembersApi: {
        postMember: jest.fn(),
        updateMember: jest.fn(),
        reorder: jest.fn(),
    },
}));

// Mock admin client hook
jest.mock('../../../../../hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: jest.fn(),
}));

// Lightweight Modal mock with named export and slot components
jest.mock('../../../../../components/common/modal/Modal', () => {
    const React = require('react');
    const Modal = ({ children, isOpen, onClose }: ModalProps) =>
        isOpen
            ? React.createElement(
                  'div',
                  { 'data-testid': 'modal' },
                  React.createElement('button', { 'data-testid': 'modal-close', onClick: onClose }),
                  children,
              )
            : null;

    (Modal as any).Title = ({ children }: any) => React.createElement(React.Fragment, null, children);
    (Modal as any).Content = ({ children }: any) => React.createElement(React.Fragment, null, children);
    (Modal as any).Actions = ({ children }: any) => React.createElement(React.Fragment, null, children);

    return { Modal };
});

// Lightweight Button mock with named export
jest.mock('../../../../../components/admin/button/Button', () => ({
    Button: ({ children, onClick, disabled }: ButtonProps) => (
        <button onClick={onClick} disabled={disabled}>
            {children}
        </button>
    ),
}));

// Lightweight QuestionModal mock with named export
jest.mock('../../../../../components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: ({ isOpen, title, onConfirm, onCancel, isButtonsDisabled }: ConfirmationModalProps) =>
        isOpen ? (
            <div data-testid="question-modal">
                <div data-testid="modal-title">{title}</div>
                <button data-testid="confirm-btn" onClick={onConfirm} disabled={isButtonsDisabled} />
                <button data-testid="cancel-btn" onClick={onCancel} disabled={isButtonsDisabled} />
            </div>
        ) : null,
}));

// Mock MemberForm with named export and inline factory (avoid TDZ issues)
jest.mock('../member-form/MemberForm', () => {
    const React = require('react');
    return {
        MemberForm: React.forwardRef((props: any, ref: any) => {
            const [isValid, setIsValid] = React.useState(false);
            const [isDirty, setIsDirty] = React.useState(false);

            React.useImperativeHandle(ref, () => ({
                submit: (status: any) => {
                    props.onSubmit(
                        {
                            fullName: 'Test Name',
                            description: 'Test Description',
                            categoryId: 1,
                            image: null,
                            imageId: null,
                        },
                        status,
                    );
                },
                isValid: () => isValid,
                isDirty: () => isDirty,
            }));

            const { onValidationChange } = props;

            React.useEffect(() => {
                onValidationChange?.(isValid);
            }, [isValid, onValidationChange]);

            return React.createElement(
                'div',
                { 'data-testid': 'member-form' },
                React.createElement('button', { 'data-testid': 'toggle-valid', onClick: () => setIsValid(!isValid) }),
                React.createElement('button', { 'data-testid': 'toggle-dirty', onClick: () => setIsDirty(!isDirty) }),
                React.createElement('div', { 'data-testid': 'initial-data' }, JSON.stringify(props.initialData)),
            );
        }),
    };
});

// Mock constants to stable english text (named exports)
jest.mock('../../../../../const/admin/team', () => ({
    TEAM_MEMBERS_TEXT: {
        FORM: {
            TITLE: { ADD_MEMBER: 'Add Member', EDIT_MEMBER: 'Edit Member' },
            MESSAGE: { FAIL_TO_CREATE_MEMBER: 'Create failed', FAIL_TO_UPDATE_MEMBER: 'Update failed' },
        },
        QUESTION: { PUBLISH_MEMBER: 'Publish?', DRAFT_MEMBER: 'Draft?' },
    },
}));

jest.mock('../../../../../const/admin/common', () => ({
    COMMON_TEXT_ADMIN: {
        FILTER: {
            STATUS: {
                ALL: 'Усі',
                PUBLISHED: 'Опубліковано',
                DRAFT: 'Чернетка',
            },
        },

        QUESTION: {
            REMOVE_FROM_PUBLICATION: 'Remove?',
            SAVE_CHANGES: 'Save changes?',
            CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE: 'Lose changes?',
        },

        BUTTON: {
            SAVE_AS_DRAFT: 'Save Draft',
            SAVE_AS_PUBLISHED: 'Save Published',
        } as any,
    } as any,
}));

const mockClient = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
} as unknown as jest.Mocked<AxiosInstance>;

const mockCategories: TeamCategory[] = [{ id: 1, name: 'Cat 1', description: '', teamMembersCount: 0 }];

const baseMember: TeamMember = {
    id: 10,
    fullName: 'Existing',
    description: 'Existing desc',
    status: VisibilityStatus.Draft,
    categoryId: 1,
    image: { id: 7, base64: 'x', mimeType: 'image/png' },
};

describe('TeamMemberModal', () => {
    const mockedUseAdminClient = useAdminClient as jest.MockedFunction<typeof useAdminClient>;
    const mockedApi = TeamMembersApi as jest.Mocked<typeof TeamMembersApi>;

    beforeEach(() => {
        mockedUseAdminClient.mockReturnValue(mockClient);
        mockedApi.postMember.mockReset();
        mockedApi.updateMember.mockReset();
    });

    it('renders add mode and disables actions until valid', () => {
        render(<TeamMemberModal mode={ModalMode.Add} isOpen={true} onClose={jest.fn()} categories={mockCategories} />);
        expect(screen.getByText('Add Member')).toBeInTheDocument();
        expect(screen.getByText('Save Draft')).toBeDisabled();
        expect(screen.getByText('Save Published')).toBeDisabled();
    });

    it('renders edit mode with initial data mapped', () => {
        render(
            <TeamMemberModal
                mode={ModalMode.Edit}
                isOpen={true}
                onClose={jest.fn()}
                memberToEdit={baseMember}
                categories={mockCategories}
            />,
        );
        expect(screen.getByText('Edit Member')).toBeInTheDocument();
        expect(screen.getByTestId('initial-data')).toHaveTextContent(
            JSON.stringify({
                fullName: baseMember.fullName,
                description: baseMember.description,
                categoryId: baseMember.categoryId,
                image: baseMember.image,
                imageId: baseMember.image && 'id' in baseMember.image ? baseMember.image?.id : null,
            }),
        );
    });

    it('submits draft in add mode after confirmation and calls onAddMember', async () => {
        const onAddMember = jest.fn();
        const onClose = jest.fn();
        const resultMember = { ...baseMember, id: 123 };
        mockedApi.postMember.mockResolvedValue(resultMember);

        render(
            <TeamMemberModal
                mode={ModalMode.Add}
                isOpen={true}
                onClose={onClose}
                onAddMember={onAddMember}
                categories={mockCategories}
            />,
        );

        await userEvent.click(screen.getByTestId('toggle-valid'));
        await userEvent.click(screen.getByText('Save Draft'));
        expect(screen.getByTestId('modal-title')).toHaveTextContent('Draft?');
        const confirmModal1 = await screen.findByTestId('question-modal');
        await userEvent.click(within(confirmModal1).getByTestId('confirm-btn'));

        await waitFor(() => {
            expect(mockedApi.postMember).toHaveBeenCalled();
            expect(onAddMember).toHaveBeenCalledWith(resultMember);
            expect(onClose).toHaveBeenCalled();
        });
    });

    it('submits publish in edit mode after confirmation and calls onEditMember', async () => {
        const onEditMember = jest.fn();
        const resultMember = { ...baseMember };
        mockedApi.updateMember.mockResolvedValue(resultMember);

        render(
            <TeamMemberModal
                mode={ModalMode.Edit}
                isOpen={true}
                onClose={jest.fn()}
                onEditMember={onEditMember}
                memberToEdit={baseMember}
                categories={mockCategories}
            />,
        );

        await userEvent.click(screen.getByTestId('toggle-valid'));
        await userEvent.click(screen.getByText('Save Published'));
        expect(screen.getByTestId('modal-title')).toHaveTextContent('Publish?');
        const confirmModal2 = await screen.findByTestId('question-modal');
        await userEvent.click(within(confirmModal2).getByTestId('confirm-btn'));

        await waitFor(() => {
            expect(mockedApi.updateMember).toHaveBeenCalled();
            expect(onEditMember).toHaveBeenCalledWith(resultMember);
        });
    });

    it('shows error message for failed create/update', async () => {
        mockedApi.postMember.mockRejectedValue(new Error('x'));
        const { unmount } = render(
            <TeamMemberModal mode={ModalMode.Add} isOpen={true} onClose={jest.fn()} categories={mockCategories} />,
        );
        const addModal = screen.getByTestId('modal');
        await userEvent.click(within(addModal).getByTestId('toggle-valid'));
        await userEvent.click(within(addModal).getByText('Save Draft'));
        const confirmModal = await screen.findByTestId('question-modal');
        await userEvent.click(within(confirmModal).getByTestId('confirm-btn'));
        await within(addModal).findByText('Create failed');

        // Unmount first modal before rendering another
        unmount();

        // Edit error
        mockedApi.updateMember.mockRejectedValue(new Error('y'));
        render(
            <TeamMemberModal
                mode={ModalMode.Edit}
                isOpen={true}
                onClose={jest.fn()}
                memberToEdit={baseMember}
                categories={mockCategories}
            />,
        );
        const editModal = screen.getByTestId('modal');
        await userEvent.click(within(editModal).getByTestId('toggle-valid'));
        await userEvent.click(within(editModal).getByText('Save Draft'));
        const confirmModal4 = await screen.findByTestId('question-modal');
        await userEvent.click(within(confirmModal4).getByTestId('confirm-btn'));
        await within(editModal).findByText('Update failed');
    });

    it('close behavior: confirms when dirty, closes immediately when clean, blocks during submit', async () => {
        const onClose = jest.fn();

        // Clean form closes immediately
        const { unmount } = render(
            <TeamMemberModal mode={ModalMode.Add} isOpen={true} onClose={onClose} categories={mockCategories} />,
        );
        await userEvent.click(screen.getByTestId('modal-close'));
        expect(onClose).toHaveBeenCalled();
        unmount();

        // Dirty form shows confirmation
        const onClose2 = jest.fn();
        const { unmount: unmount2 } = render(
            <TeamMemberModal mode={ModalMode.Add} isOpen={true} onClose={onClose2} categories={mockCategories} />,
        );
        const dirtyModal = screen.getByTestId('modal');
        await userEvent.click(within(dirtyModal).getByTestId('toggle-dirty'));
        await userEvent.click(within(dirtyModal).getByTestId('modal-close'));
        expect(screen.getByTestId('modal-title')).toHaveTextContent('Lose changes?');
        await userEvent.click(screen.getByTestId('cancel-btn'));
        expect(onClose2).not.toHaveBeenCalled();
        unmount2();

        // While submitting, close should not fire
        const onClose3 = jest.fn();
        mockedApi.postMember.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
        render(<TeamMemberModal mode={ModalMode.Add} isOpen={true} onClose={onClose3} categories={mockCategories} />);
        const submitModal = screen.getByTestId('modal');
        await userEvent.click(within(submitModal).getByTestId('toggle-valid'));
        await userEvent.click(within(submitModal).getByText('Save Draft'));
        const confirmModal3 = await screen.findByTestId('question-modal');
        fireEvent.click(within(confirmModal3).getByTestId('confirm-btn'));
        await userEvent.click(within(submitModal).getByTestId('modal-close'));
        expect(onClose3).not.toHaveBeenCalled();
    });
});
