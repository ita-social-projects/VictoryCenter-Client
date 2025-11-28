import styles from './AdminHomePage.module.scss';
import { ReactComponent as ArrowIcon } from '../../../assets/icons/arrow-left.svg';
import { MAIN_TEXT, SUB_TEXT, HINT_TEXT } from '../../../const/admin/home';

export const AdminHomePage = () => {
    return (
        <div className={styles['admin-page-content']}>
            <div className={styles['admin-page-main-text']}>
                <h1>{MAIN_TEXT}</h1>
            </div>
            <div className={styles['admin-page-sub-text']}>
                <p>{SUB_TEXT}</p>
            </div>
            <div className={styles['admin-page-action-hint']}>
                <ArrowIcon className={styles['admin-page-action-hint-icon']} />
                <p>{HINT_TEXT}</p>
            </div>
        </div>
    );
};
