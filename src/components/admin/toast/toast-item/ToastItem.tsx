import { Toast } from '../../../../types/admin/toast';
import './ToastItem.scss';
import InfoIcon from '../../../../assets/icons/info.svg';
import { COMMON_TEXT_ADMIN } from '../../../../const/admin/common';

export const ToastItem = ({ toast }: { toast: Toast }) => {
    return (
        <div className={`toast ${toast.type}`}>
            <img src={InfoIcon} alt={COMMON_TEXT_ADMIN.ALT.HINT} />
            {toast.message}
        </div>
    );
};
