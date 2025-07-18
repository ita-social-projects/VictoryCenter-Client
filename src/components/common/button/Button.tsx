import React from "react";
import "./button.scss";

type ButtonProps = {
    children: React.ReactNode,
    buttonStyle?: 'primary' | 'secondary',
    onClick?: () => void;
    type?: "submit" | "reset" | "button"
    form?: string;
    className?: string;
    disabled?: boolean | undefined;
};

export const Button = ({children, onClick, buttonStyle, type = "button", form, disabled = false, className = ''}: ButtonProps) => {
    const getClassName = () => {
        let baseClass = "";
        switch (buttonStyle) {
            case "primary":
                baseClass = "btn-primary";
                break;
            case "secondary":
                baseClass = "btn-secondary";
                break;
            default:
                baseClass = "";
        }

        if (disabled && baseClass) {
            return `${baseClass} ${baseClass}-disabled`;
        }

        return baseClass;
    }

    return (<button form={form} type={type} className={`${getClassName()} ${className}`} onClick={onClick} disabled={disabled}>
        {children}
    </button>);
}

export default Button;
