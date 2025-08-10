import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DeleteTeamMemberModal } from './DeleteTeamMemberModal';
import { TeamMembersApi } from '../../../../../services/data-fetch/admin-page-data-fetch/team-page-data-fetch/TeamMembersApi/TeamMembersApi';
import { useAdminClient } from '../../../../../utils/hooks/use-admin-client/useAdminClient';
import { TEAM_MEMBERS_TEXT } from '../../../../../const/admin/team';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';

jest.mock('../../../../../utils/hooks/use-admin-client/useAdminClient', () => ({
    useAdminClient: jest.fn(),
}));
jest.mock(
    '../../../../../services/data-fetch/admin-page-data-fetch/team-page-data-fetch/TeamMembersApi/TeamMembersApi',
    () => ({
        TeamMembersApi: {
            delete: jest.fn(),
        },
    }),
);

describe('DeleteTeamMemberModal', () => {
    const onClose = jest.fn();
    const onDeleteMember = jest.fn();

    const member = {
        id: 123,
        image: null,
        fullName: 'John Doe',
        description: 'Developer',
        status: 0,
        categoryId: 1,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useAdminClient as jest.Mock).mockReturnValue({});
    });

    it('renders modal when open with title and buttons', () => {
        render(
            <DeleteTeamMemberModal
                isOpen={true}
                onClose={onClose}
                memberToDelete={member}
                onDeleteMember={onDeleteMember}
            />,
        );

        expect(screen.getByText(TEAM_MEMBERS_TEXT.FORM.TITLE.DELETE_MEMBER)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.NO })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES })).toBeInTheDocument();
    });

    it('does not render modal content when closed', () => {
        const { container } = render(
            <DeleteTeamMemberModal
                isOpen={false}
                onClose={onClose}
                memberToDelete={member}
                onDeleteMember={onDeleteMember}
            />,
        );
        expect(container).toBeEmptyDOMElement();
    });

    it('calls onClose when clicking "No" button and resets error', () => {
        render(
            <DeleteTeamMemberModal
                isOpen={true}
                onClose={onClose}
                memberToDelete={member}
                onDeleteMember={onDeleteMember}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.NO }));

        expect(onClose).toHaveBeenCalledTimes(1);
        expect(screen.queryByText(TEAM_MEMBERS_TEXT.FORM.MESSAGE.FAIL_TO_DELETE_MEMBER)).not.toBeInTheDocument();
    });

    it('calls delete API and callbacks on successful confirm delete', async () => {
        (TeamMembersApi.delete as jest.Mock).mockResolvedValue(undefined);

        render(
            <DeleteTeamMemberModal
                isOpen={true}
                onClose={onClose}
                memberToDelete={member}
                onDeleteMember={onDeleteMember}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES }));

        expect(TeamMembersApi.delete).toHaveBeenCalledWith({}, member.id);

        await waitFor(() => {
            expect(onDeleteMember).toHaveBeenCalledWith(member);
            expect(onClose).toHaveBeenCalled();
        });
    });

    it('does not call API when member to delete is null', async () => {
        (TeamMembersApi.delete as jest.Mock).mockResolvedValue(undefined);

        render(
            <DeleteTeamMemberModal
                isOpen={true}
                onClose={onClose}
                memberToDelete={null}
                onDeleteMember={onDeleteMember}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES }));

        expect(TeamMembersApi.delete).not.toHaveBeenCalled();

        await waitFor(() => {
            expect(onDeleteMember).not.toHaveBeenCalled();
            expect(onClose).not.toHaveBeenCalled();
        });
    });

    it('shows error message on failed delete', async () => {
        (TeamMembersApi.delete as jest.Mock).mockRejectedValue(new Error('Failed'));

        render(
            <DeleteTeamMemberModal
                isOpen={true}
                onClose={onClose}
                memberToDelete={member}
                onDeleteMember={onDeleteMember}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES }));

        await waitFor(() => {
            expect(screen.getByText(TEAM_MEMBERS_TEXT.FORM.MESSAGE.FAIL_TO_DELETE_MEMBER)).toBeInTheDocument();
        });

        expect(onDeleteMember).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
    });

    it('prevents closing modal while submitting', async () => {
        let resolvePromise: () => void;
        const neverResolvingPromise = new Promise<void>((resolve) => {
            resolvePromise = resolve;
        });
        (TeamMembersApi.delete as jest.Mock).mockReturnValue(neverResolvingPromise);

        render(
            <DeleteTeamMemberModal
                isOpen={true}
                onClose={onClose}
                memberToDelete={member}
                onDeleteMember={onDeleteMember}
            />,
        );

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.YES }));

        fireEvent.click(screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.NO }));

        expect(onClose).not.toHaveBeenCalled();

        resolvePromise!();

        await waitFor(() => {
            const btn = screen.getByRole('button', { name: COMMON_TEXT_ADMIN.BUTTON.NO });
            expect(btn).toBeInTheDocument();
        });

        expect(onClose).toHaveBeenCalledTimes(1);
    });
});
