import styles from './InputLabel.module.scss';

export interface InputLabelProps {
    htmlFor: string;
    text: string;
    isRequired?: boolean;
}

export const InputLabel = ({ htmlFor, text, isRequired }: InputLabelProps) => (
    <label htmlFor={htmlFor} className={styles['input-label']}>
        {isRequired && <span className={styles['required-field']}>*</span>}
        {text}
    </label>
);
