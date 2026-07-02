import { ReactComponent as CheckmarkIcon } from '@/assets/icons/checkmark.svg';
import { ReactComponent as CrossIcon } from '@/assets/icons/cross.svg';
import { IconButton } from '@/components/admin/icon-button/IconButton';
import { ACTION_ICONS } from '@/const/common/action-icons';
import { InlineLoader } from '@/components/common/inline-loader/InlineLoader';
import styles from './RowEditActions.module.scss';
import cn from 'classnames';

interface RowEditActionsProps {
    recordId: number;
    isEditMode: boolean;
    isAcceptDisabled: boolean;
    isSaving: boolean;
    isActionsDisabled: boolean;
    onAccept: () => void;
    onClose: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export const RowEditActions = ({
    recordId,
    isEditMode,
    isAcceptDisabled,
    isSaving,
    isActionsDisabled,
    onAccept,
    onClose,
    onEdit,
    onDelete,
}: RowEditActionsProps) => (
    <div className={styles['row-actions']}>
        {isEditMode ? (
            <>
                <button
                    type="button"
                    className={cn(styles['icon-button'], styles['accept-icon-button'])}
                    aria-label={`Accept record ${recordId}`}
                    onClick={onAccept}
                    disabled={isAcceptDisabled || isSaving}
                >
                    {isSaving ? <InlineLoader size={1.2} /> : <CheckmarkIcon className={styles['action-icon']} />}
                </button>
                <button
                    type="button"
                    className={cn(styles['icon-button'], styles['close-icon-button'])}
                    aria-label={`Close edit for record ${recordId}`}
                    onClick={onClose}
                    disabled={isSaving}
                >
                    <CrossIcon className={styles['action-icon']} />
                </button>
            </>
        ) : (
            <>
                <IconButton
                    type="button"
                    className={cn(styles['icon-button'], styles['edit-icon-button'])}
                    aria-label={`Edit record ${recordId}`}
                    onClick={onEdit}
                    disabled={isActionsDisabled}
                    DefaultIcon={ACTION_ICONS.edit.default}
                    FilledIcon={ACTION_ICONS.edit.hover}
                />
                <IconButton
                    type="button"
                    className={cn(styles['icon-button'], styles['delete-icon-button'])}
                    aria-label={`Delete record ${recordId}`}
                    onClick={onDelete}
                    disabled={isActionsDisabled}
                    DefaultIcon={ACTION_ICONS.delete.default}
                    FilledIcon={ACTION_ICONS.delete.hover}
                />
            </>
        )}
    </div>
);
