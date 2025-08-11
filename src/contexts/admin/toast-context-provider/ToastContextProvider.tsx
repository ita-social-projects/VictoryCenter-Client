import { Toast, ToastType } from '../../../types/admin/toast';
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';

interface ToastContextType {
    toasts: Toast[];
    addToast: (message: string, type?: ToastType, duration?: number) => void;
    removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = ToastType.Info, duration = 3000) => {
        const id = Date.now();
        const newToast: Toast = {
            id: id,
            duration: duration,
            message: message,
            type: type,
        };
        setToasts((prev) => [...prev, newToast]);
        setTimeout(() => removeToast(id), duration);
    }, []);

    const removeToast = (id: number) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };
    const contextValue = useMemo(() => ({ toasts, addToast, removeToast }), [addToast, toasts]);

    return <ToastContext.Provider value={contextValue}>{children}</ToastContext.Provider>;
};

export const useToast = () => useContext(ToastContext) as ToastContextType;
