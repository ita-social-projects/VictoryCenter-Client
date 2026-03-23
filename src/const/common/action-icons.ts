import { ReactComponent as EditIcon } from '@/assets/icons/edit.svg';
import { ReactComponent as EditFilledIcon } from '@/assets/icons/edit-filled.svg';
import { ReactComponent as DeleteIcon } from '@/assets/icons/delete.svg';
import { ReactComponent as DeleteFilledIcon } from '@/assets/icons/delete-filled.svg';
import { ReactComponent as TranslateIcon } from '@/assets/icons/translate.svg';

export const ACTION_ICONS = {
    edit: { default: EditIcon, hover: EditFilledIcon },
    delete: { default: DeleteIcon, hover: DeleteFilledIcon },
    translate: { default: TranslateIcon },
};
