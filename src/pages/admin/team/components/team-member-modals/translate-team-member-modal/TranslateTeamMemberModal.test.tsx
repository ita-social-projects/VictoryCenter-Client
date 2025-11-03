import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TranslateTeamMemberModal } from './TranslateTeamMemberModal';
import { useAdminClient } from '../../../../../../hooks/admin/use-admin-client/useAdminClient';
import { useGenericModal } from '../../../../../../hooks/admin/use-generic-modal/useGenericModal';
import { TeamMember } from '../../../../../../types/admin/team-members';

// Mock hooks
jest.mock('../../../../../../hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: jest.fn(),
}));
jest.mock('../../../../../../hooks/admin/use-generic-modal/useGenericModal', () => ({
    useGenericModal: jest.fn(),
}));

// Mock constants
jest.mock('../../../../../../const/admin/team', () => ({
    TEAM_MEMBERS_TEXT: {
        FORM: {
            TITLE: {
                TRANSLATE_MEMBER: 'Translate Member',
            },
        },
    },
}));

// Mock LocalizationModalWrapper with named export
jest.mock(
    '../../../../../../components/admin/modal-wrappers/localization-modal-wrapper/LocalizationModalWrapper',
    () => ({
        LocalizationModalWrapper: ({ isOpen, onClose, title, onFormValidationChange, renderForm }: any) => {
            if (!isOpen) return null;
            return (
                <div data-testid="wrapper">
                    <div data-testid="title">{title}</div>
                    <button data-testid="close-btn" onClick={onClose}>
                        close
                    </button>
                    <button data-testid="validate-btn" onClick={() => onFormValidationChange(true)}>
                        validate
                    </button>
                    <div data-testid="form">{renderForm({ key: 'f1', formDisabled: false })}</div>
                </div>
            );
        },
    }),
);

// Mock TranslateMemberForm
jest.mock('../../forms/translate-member-form/TranslateMemberForm', () => {
    const React = require('react');
    return {
        TranslateMemberForm: React.forwardRef(({ onValidationChange, onSubmit }: any, ref: any) => {
            React.useImperativeHandle(ref, () => ({
                submit: jest.fn(),
            }));

            return (
                <div data-testid="translate-form">
                    <button data-testid="validate-form" onClick={() => onValidationChange(true)}>
                        validate form
                    </button>
                    <button data-testid="submit-form" onClick={() => onSubmit({})}>
                        submit form
                    </button>
                </div>
            );
        }),
    };
});

describe('TranslateTeamMemberModal', () => {
    const mockClient = {};
    const memberToEdit: TeamMember = {
        id: 1,
        fullName: 'Test Member',
        description: 'desc',
        status: 0,
        categoryId: 2,
        image: null,
        localizations: [],
    };

    const handleClose = jest.fn();
    const handleFormValidationChange = jest.fn();
    const handlePublishSubmit = jest.fn();
    const handleConfirmAction = jest.fn();
    const handleCancelConfirmation = jest.fn();
    const handleConfirmClose = jest.fn();
    const handleCancelClose = jest.fn();
    const formRef = { current: null };

    beforeEach(() => {
        (useAdminClient as jest.Mock).mockReturnValue(mockClient);
        (useGenericModal as jest.Mock).mockReturnValue({
            handleClose,
            handleFormValidationChange,
            handlePublishSubmit,
            handleConfirmAction,
            handleCancelConfirmation,
            handleConfirmClose,
            handleCancelClose,
            formRef,
        });
        jest.clearAllMocks();
    });

    it('renders wrapper and form when open', () => {
        render(
            <TranslateTeamMemberModal
                isOpen={true}
                onClose={jest.fn()}
                onTranslateMember={jest.fn()}
                memberToEdit={memberToEdit}
            />,
        );

        expect(screen.getByTestId('wrapper')).toBeInTheDocument();
        expect(screen.getByTestId('title')).toHaveTextContent('Translate Member');
        expect(screen.getByTestId('translate-form')).toBeInTheDocument();
    });

    it('triggers handleFormValidationChange from wrapper button', () => {
        render(
            <TranslateTeamMemberModal
                isOpen={true}
                onClose={jest.fn()}
                onTranslateMember={jest.fn()}
                memberToEdit={memberToEdit}
            />,
        );

        fireEvent.click(screen.getByTestId('validate-btn'));
        expect(handleFormValidationChange).toHaveBeenCalledWith(true);
    });

    it('calls handleClose when close button clicked', () => {
        render(
            <TranslateTeamMemberModal
                isOpen={true}
                onClose={jest.fn()}
                onTranslateMember={jest.fn()}
                memberToEdit={memberToEdit}
            />,
        );

        fireEvent.click(screen.getByTestId('close-btn'));
        expect(handleClose).toHaveBeenCalled();
    });

    it('renders nothing when not open', () => {
        render(
            <TranslateTeamMemberModal
                isOpen={false}
                onClose={jest.fn()}
                onTranslateMember={jest.fn()}
                memberToEdit={memberToEdit}
            />,
        );
        expect(screen.queryByTestId('wrapper')).not.toBeInTheDocument();
    });
});
