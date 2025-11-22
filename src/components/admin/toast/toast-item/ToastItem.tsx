import { Toast } from '../../../../types/admin/toast';
import styles from './ToastItem.module.scss';
import { ReactComponent as InfoIcon } from '../../../../assets/icons/info.svg';

export const ToastItem = ({ toast }: { toast: Toast }) => {
    return (
        <div className={`${styles['toast']} ${styles[toast.type]}`}>
            <InfoIcon />
            {toast.message}
        </div>
    );
};
