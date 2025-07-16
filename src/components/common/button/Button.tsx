import React from 'react';
import classNames from 'classnames';
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
    return (
        <button
            form={form}
            type={type}
            className={classNames(className, {
                'btn-primary': buttonStyle === 'primary',
                'btn-secondary': buttonStyle === 'secondary',
            })}
            onClick={onClick}
        >
            {children}
        </button>
    );
};
