import styles from './InputError.module.scss';

export interface InputErrorProps {
    error?: string;
}

export const InputError = ({ error }: InputErrorProps) => {
    return error ? <span className={styles['input-error']}>{error}</span> : null;
};
