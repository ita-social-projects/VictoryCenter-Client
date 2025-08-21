import { Toast } from '../../../../types/admin/toast';
import './ToastItem.scss';
import { ReactComponent as InfoIcon } from '../../../../assets/icons/info.svg';

export const ToastItem = ({ toast }: { toast: Toast }) => {
    return (
        <div className={`toast ${toast.type}`}>
            <InfoIcon />
            {toast.message}
        </div>
    );
};
