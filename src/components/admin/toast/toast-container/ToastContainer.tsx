import React from 'react';
import { ToastItem } from '../toast-item/ToastItem';
import { useToast } from '../../../../contexts/admin/toast-context-provider/ToastContextProvider';
import './ToastContainer.scss';
export const ToastContainer = () => {
    const { toasts } = useToast();

    return (
        <div className="toast-container">
            {toasts.map((t) => (
                <ToastItem key={t.id} toast={t} />
            ))}
        </div>
    );
};
