import './InputLabel.scss';

export interface InputLabelProps {
    htmlFor: string;
    text: string;
    isRequired?: boolean;
}

export const InputLabel = ({ htmlFor, text, isRequired }: InputLabelProps) => (
    <label htmlFor={htmlFor}>
        {isRequired && <span className="required-field">*</span>}
        {text}
    </label>
);
