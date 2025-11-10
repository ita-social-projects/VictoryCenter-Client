export interface Toast {
    id: number;
    message: string;
    type: ToastType;
    duration: number;
}

export enum ToastType {
    Info = 'info',
    Error = 'error',
}
