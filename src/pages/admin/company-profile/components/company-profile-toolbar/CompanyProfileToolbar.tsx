import { Button } from '@/components/admin/button/Button';
import { ACTION_ICONS } from '@/const/common/action-icons';
import cn from 'classnames';
import { COMPANY_PROFILE_TEXT } from '@/const/admin/company-profile';
import styles from './CompanyProfileToolbar.module.scss';

export interface ProfileToolbarProps {
    isEditMode: boolean;
    onEdit: () => void;
    onCancel: () => void;
    onPublish: () => void;
    isPublishDisabled: boolean;
}

export const ProfileToolbar = ({ isEditMode, onEdit, onCancel, onPublish, isPublishDisabled }: ProfileToolbarProps) => {
    const EditIcon = ACTION_ICONS.edit.default;

    return (
        <div className={cn(styles.profileToolbarActions)} data-testid="profile-page-toolbar">
            {isEditMode ? (
                <>
                    <Button onClick={onCancel} buttonStyle="secondary">
                        {COMPANY_PROFILE_TEXT.TOOLBAR.CANCEL}
                    </Button>
                    <Button onClick={onPublish} buttonStyle="primary" disabled={isPublishDisabled}>
                        {COMPANY_PROFILE_TEXT.TOOLBAR.PUBLISH}
                    </Button>
                </>
            ) : (
                <Button onClick={onEdit} buttonStyle="primary">
                    <EditIcon />
                    {COMPANY_PROFILE_TEXT.TOOLBAR.EDIT_PAGE}
                </Button>
            )}
        </div>
    );
};
