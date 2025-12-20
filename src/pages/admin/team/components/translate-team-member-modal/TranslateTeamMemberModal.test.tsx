import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TranslateTeamMemberModal } from './TranslateTeamMemberModal';
import { TeamMember } from '@/types/admin/team-members';
import { TEAM_MEMBERS_TEXT } from '@/const/admin/team';
import { TeamMemberLocalizationsApi } from '@/services/api/admin/team/team-member-localizations/team-member-localizations-api';

jest.mock('@/components/admin/button/Button', () => ({
    Button: (props: any) => <button {...props}>{props.children}</button>,
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

jest.mock('@/hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: () => ({}),
}));

jest.mock('@/services/api/admin/team/team-member-localizations/team-member-localizations-api', () => ({
    TeamMemberLocalizationsApi: {
        create: jest.fn(async () => ({
            id: 10,
            entityId: 1,
            languageId: 2,
            fullName: 'Translated Name',
            description: 'Translated Description',
        })),
    },
}));

jest.mock('@/utils/functions/mappers/common/localization/localization-mappers', () => ({
    mapLocalizationDtoToModel: (_dto: any) => ({
        id: 10,
        fullName: 'Translated Name',
        description: 'Translated Description',
        languageId: 2,
    }),
}));

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
    it('renders modal when open and member exists', () => {
        render(
            <TranslateTeamMemberModal
                isOpen
                onClose={jest.fn()}
                memberToTranslate={member}
                onTranslateMember={jest.fn()}
                language={language}
            />,
        );

        expect(screen.getByTestId('modal')).toBeInTheDocument();
        expect(screen.getByTestId('translate-form')).toBeInTheDocument();
    });

    it('does not render when memberToTranslate is null', () => {
        render(
            <TranslateTeamMemberModal
                isOpen
                onClose={jest.fn()}
                memberToTranslate={null}
                onTranslateMember={jest.fn()}
                language={language}
            />,
        );

        expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
    });

    it('enables translate button when form is valid', () => {
        render(
            <TranslateTeamMemberModal
                isOpen
                onClose={jest.fn()}
                memberToTranslate={member}
                onTranslateMember={jest.fn()}
                language={language}
            />,
        );

        const button = screen.getByRole('button');
        expect(button).toBeEnabled();
    });

    it('submits translation and calls onTranslateMember and onClose', async () => {
        const onTranslateMember = jest.fn();
        const onClose = jest.fn();

        render(
            <TranslateTeamMemberModal
                isOpen
                onClose={onClose}
                memberToTranslate={member}
                onTranslateMember={onTranslateMember}
                language={language}
            />,
        );

        const button = screen.getByRole('button');

        fireEvent.click(button);

        await waitFor(() => {
            expect(onTranslateMember).toHaveBeenCalledTimes(1);
        });

        expect(onTranslateMember).toHaveBeenCalledWith(
            expect.objectContaining({
                localizations: expect.arrayContaining([
                    expect.objectContaining({
                        fullName: 'Translated Name',
                    }),
                ]),
            }),
        );

        expect(onClose).toHaveBeenCalled();
    });

    it('shows confirmation modal on close when form is dirty', () => {
        const onClose = jest.fn();

        render(
            <TranslateTeamMemberModal
                isOpen
                onClose={onClose}
                memberToTranslate={member}
                onTranslateMember={jest.fn()}
                language={language}
            />,
        );

        fireEvent.click(screen.getByTestId('modal'));

        expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
    });

    it('confirms close in confirmation modal', () => {
        const onClose = jest.fn();

        render(
            <TranslateTeamMemberModal
                isOpen
                onClose={onClose}
                memberToTranslate={member}
                onTranslateMember={jest.fn()}
                language={language}
            />,
        );

        fireEvent.click(screen.getByTestId('modal'));

        fireEvent.click(screen.getByTestId('confirm-close'));

        expect(onClose).toHaveBeenCalled();
    });

    it('cancels close in confirmation modal', () => {
        const onClose = jest.fn();

        render(
            <TranslateTeamMemberModal
                isOpen
                onClose={onClose}
                memberToTranslate={member}
                onTranslateMember={jest.fn()}
                language={language}
            />,
        );

        fireEvent.click(screen.getByTestId('modal'));
        fireEvent.click(screen.getByTestId('cancel-close'));

        expect(onClose).not.toHaveBeenCalled();
    });

    it('shows error message if API fails', async () => {
        const onTranslateMember = jest.fn();
        const onClose = jest.fn();

        jest.spyOn(TeamMemberLocalizationsApi, 'create').mockRejectedValue(new Error('Fail'));

        render(
            <TranslateTeamMemberModal
                isOpen
                onClose={onClose}
                memberToTranslate={member}
                onTranslateMember={onTranslateMember}
                language={language}
            />,
        );

        const button = screen.getByRole('button');

        fireEvent.click(button);

        await waitFor(() => {
            expect(screen.getByText(TEAM_MEMBERS_TEXT.FORM.MESSAGE.FAIL_TO_TRANSLATE_MEMBER)).toBeInTheDocument();
        });

        expect(onTranslateMember).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });

    it('disables translate button while submitting', async () => {
        const onTranslateMember = jest.fn();
        const onClose = jest.fn();

        let resolvePromise: any;
        jest.spyOn(TeamMemberLocalizationsApi, 'create').mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolvePromise = resolve;
                }),
        );

        render(
            <TranslateTeamMemberModal
                isOpen
                onClose={onClose}
                memberToTranslate={member}
                onTranslateMember={onTranslateMember}
                language={language}
            />,
        );

        const button = screen.getByTestId('translate-submit-btn');

        fireEvent.click(button);
        expect(button).toBeDisabled();

        resolvePromise({
            id: 10,
            entityId: 1,
            languageId: 2,
            fullName: 'Translated Name',
            description: 'Translated Description',
        });

        await waitFor(() => {
            expect(onClose).toHaveBeenCalled();
        });
    });
});
