import React from 'react';
import './Button.scss';

export type ButtonProps = {
    children: React.ReactNode;
    buttonStyle?: 'primary' | 'secondary';
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    type?: 'submit' | 'reset' | 'button';
    formId?: string;
    className?: string;
    disabled?: boolean;
};

const getBaseClassName = (buttonStyle?: 'primary' | 'secondary') => {
    switch (buttonStyle) {
        case 'primary':
            return 'btn-primary';
        case 'secondary':
            return 'btn-secondary';
        default:
            return '';
    }
};

export const Button = ({
    children,
    onClick,
    buttonStyle,
    type = 'button',
    formId,
    disabled = false,
    className = '',
}: ButtonProps) => {
    const finalClassName = `${getBaseClassName(buttonStyle)} ${className}`.trim();

    return (
        <button form={formId} type={type} className={finalClassName} onClick={onClick} disabled={disabled}>
            {children}
        </button>
    );
};
