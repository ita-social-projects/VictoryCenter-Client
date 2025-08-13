import './InputError.scss';

export interface InputErrorProps {
    error?: string;
}

export const InputError = ({ error }: InputErrorProps) => {
    if (!error) return null;
    return <span className="input-error">{error}</span>;
};
