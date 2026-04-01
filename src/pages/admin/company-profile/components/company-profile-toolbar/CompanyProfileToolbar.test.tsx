import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ProfileToolbar } from './CompanyProfileToolbar';
import { COMPANY_PROFILE_TEXT } from '@/const/admin/company-profile';

jest.mock('@/const/common/action-icons', () => ({
    ACTION_ICONS: {
        edit: {
            default: () => <svg data-testid="edit-icon" />,
        },
    },
}));

describe('ProfileToolbar', () => {
    it('renders view mode with edit button and triggers onEdit', () => {
        const onEdit = jest.fn();
        const onCancel = jest.fn();
        const onPublish = jest.fn();

        render(
            <ProfileToolbar
                isEditMode={false}
                onEdit={onEdit}
                onCancel={onCancel}
                onPublish={onPublish}
                isPublishDisabled={false}
            />,
        );

        expect(screen.getByTestId('profile-page-toolbar')).toBeInTheDocument();
        expect(screen.getByTestId('edit-icon')).toBeInTheDocument();

        const editButton = screen.getByRole('button', { name: COMPANY_PROFILE_TEXT.TOOLBAR.EDIT_PAGE });
        fireEvent.click(editButton);

        expect(onEdit).toHaveBeenCalledTimes(1);
        expect(screen.queryByRole('button', { name: COMPANY_PROFILE_TEXT.TOOLBAR.CANCEL })).not.toBeInTheDocument();
        expect(screen.queryByRole('button', { name: COMPANY_PROFILE_TEXT.TOOLBAR.PUBLISH })).not.toBeInTheDocument();
    });

    it('renders edit mode with cancel/publish and triggers handlers', () => {
        const onEdit = jest.fn();
        const onCancel = jest.fn();
        const onPublish = jest.fn();

        render(
            <ProfileToolbar
                isEditMode={true}
                onEdit={onEdit}
                onCancel={onCancel}
                onPublish={onPublish}
                isPublishDisabled={false}
            />,
        );

        const cancelButton = screen.getByRole('button', { name: COMPANY_PROFILE_TEXT.TOOLBAR.CANCEL });
        const publishButton = screen.getByRole('button', { name: COMPANY_PROFILE_TEXT.TOOLBAR.PUBLISH });

        expect(cancelButton).toBeInTheDocument();
        expect(publishButton).toBeInTheDocument();

        fireEvent.click(cancelButton);
        fireEvent.click(publishButton);

        expect(onCancel).toHaveBeenCalledTimes(1);
        expect(onPublish).toHaveBeenCalledTimes(1);
    });

    it('disables publish button when isPublishDisabled=true', () => {
        render(
            <ProfileToolbar
                isEditMode={true}
                onEdit={jest.fn()}
                onCancel={jest.fn()}
                onPublish={jest.fn()}
                isPublishDisabled={true}
            />,
        );

        expect(screen.getByRole('button', { name: COMPANY_PROFILE_TEXT.TOOLBAR.PUBLISH })).toBeDisabled();
    });
});
