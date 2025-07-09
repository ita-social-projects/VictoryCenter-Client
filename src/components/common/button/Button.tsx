import React from 'react';
import './button.scss';
type ButtonProps = {
    children: React.ReactNode;
    buttonStyle?: 'primary' | 'secondary';
    onClick?: () => void;
    type?: 'submit' | 'reset' | 'button';
    form?: string;
    className?: string;
};
export const Button = ({ children, onClick, buttonStyle, type = 'button', form, className = '' }: ButtonProps) => {
    const getClassName = () => {
        switch (buttonStyle) {
            case 'primary':
                return 'btn-primary';
            case 'secondary':
                return 'btn-secondary';
            default:
                return '';
        }
    };

    return (
        <button form={form} type={type} className={`${getClassName()} ${className}`} onClick={onClick}>
            {children}
        </button>
    );
};
