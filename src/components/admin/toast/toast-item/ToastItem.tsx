import { Toast } from '@/types/admin/toast';
import { ReactComponent as InfoIcon } from '@/assets/icons/info.svg';
import './ToastItem.scss';

export const ToastItem = ({ toast }: { toast: Toast }) => {
    return (
        <div className={`toast ${toast.type}`}>
            <InfoIcon />
            {toast.message}
        </div>
    );
};
