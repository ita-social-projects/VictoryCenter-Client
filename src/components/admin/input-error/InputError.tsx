import './InputError.scss';

export interface InputErrorProps {
    error?: string;
}

export const InputError = ({ error }: InputErrorProps) => {
    return error ? <span className="input-error">{error}</span> : null;
};
