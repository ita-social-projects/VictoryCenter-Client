import { Button } from '@/components/admin/button/Button';
import { ReactComponent as EditIcon } from '@/assets/icons/edit.svg';
import { COMPANY_PROFILE_TEXT } from '@/const/admin/company-profile';
import './CompanyProfileToolbar.scss';

export interface ProfileToolbarProps {
    isEditMode: boolean;
    onEdit: () => void;
    onCancel: () => void;
    onPublish: () => void;
    isPublishDisabled: boolean;
}

export const ProfileToolbar = ({ isEditMode, onEdit, onCancel, onPublish, isPublishDisabled }: ProfileToolbarProps) => {
    return (
        <div className="profile-toolbar-actions" data-testid="profile-page-toolbar">
            {!isEditMode ? (
                <Button onClick={onEdit} buttonStyle="primary">
                    <EditIcon />
                    {COMPANY_PROFILE_TEXT.TOOLBAR.EDIT_PAGE}
                </Button>
            ) : (
                <>
                    <Button onClick={onCancel} buttonStyle="secondary">
                        {COMPANY_PROFILE_TEXT.TOOLBAR.CANCEL}
                    </Button>
                    <Button onClick={onPublish} buttonStyle="primary" disabled={isPublishDisabled}>
                        {COMPANY_PROFILE_TEXT.TOOLBAR.PUBLISH}
                    </Button>
                </>
            )}
        </div>
    );
};
