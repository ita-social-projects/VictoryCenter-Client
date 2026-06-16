import { Button } from '@/components/admin/button/Button';
import { HISTORY_TEXT } from '@/const/admin/history';
import { ReactComponent as PlusIcon } from '@/assets/icons/plus.svg';
import { ACTION_ICONS } from '@/const/common/action-icons';
import { IconButton } from '@/components/admin/icon-button/IconButton';
import styles from './HistoryPageToolbar.module.scss';

export interface HistoryPageToolbarProps {
    onAddSection: () => void;
    onTranslate: () => void;
}

export const HistoryPageToolbar = ({ onAddSection, onTranslate }: HistoryPageToolbarProps) => {
    return (
        <div className={styles['history-page-toolbar']}>
            <div className={styles['actions-wrapper']}>
                <IconButton
                    DefaultIcon={ACTION_ICONS.translate.default}
                    onClick={onTranslate}
                    aria-label={HISTORY_TEXT.BUTTON.TRANSLATE}
                    type="button"
                />
                <Button onClick={onAddSection} buttonStyle="primary">
                    {HISTORY_TEXT.BUTTON.ADD_SECTION}
                    <PlusIcon />
                </Button>
            </div>
        </div>
    );
};
