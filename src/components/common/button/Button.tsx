import React from 'react';
import './Button.scss';

export type ButtonProps = {
    children: React.ReactNode;
    buttonStyle?: 'primary' | 'secondary';
    onClick?: () => void;
    type?: 'submit' | 'reset' | 'button';
    form?: string;
    className?: string;
    disabled?: boolean;
};

const getClassName = (buttonStyle?: 'primary' | 'secondary', disabled: boolean = false) => {
    let baseClass: string;
    switch (buttonStyle) {
        case 'primary':
            baseClass = 'btn-primary';
            break;
        case 'secondary':
            baseClass = 'btn-secondary';
            break;
        default:
            baseClass = '';
    }

    if (disabled && baseClass) {
        return `${baseClass} ${baseClass}-disabled`;
    }

    return baseClass;
};

export const Button = ({
    children,
    onClick,
    buttonStyle,
    type = 'button',
    form,
    disabled = false,
    className = '',
}: ButtonProps) => {
    return (
        <button
            form={form}
            type={type}
            className={`${getClassName(buttonStyle, disabled)} ${className}`}
            onClick={onClick}
            disabled={disabled}
        >
            {children}
        </button>
    );
};
