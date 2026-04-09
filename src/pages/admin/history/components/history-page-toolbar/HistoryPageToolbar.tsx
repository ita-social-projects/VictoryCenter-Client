import { Button } from '@/components/admin/button/Button';
import { HISTORY_TEXT } from '@/const/admin/history';
import { ReactComponent as PlusIcon } from '@/assets/icons/plus.svg';
import styles from './HistoryPageToolbar.module.scss';

export interface HistoryPageToolbarProps {
    onAddSection: () => void;
}

export const HistoryPageToolbar = ({ onAddSection }: HistoryPageToolbarProps) => {
    return (
        <div className={styles['history-page-toolbar']}>
            <Button onClick={onAddSection} buttonStyle="primary">
                {HISTORY_TEXT.BUTTON.ADD_SECTION}
                <PlusIcon />
            </Button>
        </div>
    );
};
