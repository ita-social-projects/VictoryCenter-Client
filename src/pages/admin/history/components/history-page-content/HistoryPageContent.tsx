import styles from './HistoryPageContent.module.scss';
import { Button } from '@/components/admin/button/Button';
import NotFoundIcon from '@/assets/icons/not-found.svg';
import { HISTORY_TEXT } from '@/const/admin/history';
import { ReactComponent as PlusIcon } from '@/assets/icons/plus.svg';
import { HistoryPageToolbar } from '../history-page-toolbar/HistoryPageToolbar';

export const HistoryPageContent = () => {
    const hasSections = false;
    const handleAddSection = () => {
        // TODO: add section creation flow will be implemented in a dedicated modal.
    };

    return (
        <div className={styles['history-page-wrapper']} data-testid="history-page-content">
            <HistoryPageToolbar onAddSection={handleAddSection} />
            <div className={styles['sections-container']}>
                {!hasSections && (
                    <div className={styles['empty-sections-state']}>
                        <img src={NotFoundIcon} alt="No sections" className={styles['empty-sections-image']} />
                        <p className={styles['empty-sections-text']}>{HISTORY_TEXT.MESSAGE.NO_SECTIONS_YET}</p>
                        <Button
                            className={styles['btn-add']}
                            onClick={handleAddSection}
                            buttonStyle="secondary"
                            data-testid="add-section-button-empty"
                        >
                            {HISTORY_TEXT.BUTTON.ADD_SECTION}
                            <PlusIcon className={styles['plus-icon']} />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
