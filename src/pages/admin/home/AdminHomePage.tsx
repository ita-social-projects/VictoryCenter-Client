import { ReactComponent as ArrowIcon } from '@/assets/icons/arrow-left.svg';
import { MAIN_TEXT, SUB_TEXT, HINT_TEXT } from '@/const/admin/home';
import './AdminHomePage.scss';

export const AdminHomePage = () => {
    return (
        <div className="admin-page-content">
            <div className="admin-page-main-text">
                <h1>{MAIN_TEXT}</h1>
            </div>
            <div className="admin-page-sub-text">
                <p>{SUB_TEXT}</p>
            </div>
            <div className="admin-page-action-hint">
                <ArrowIcon className="admin-page-action-hint-icon" />
                <p>{HINT_TEXT}</p>
            </div>
        </div>
    );
};
