import React from "react";
import "./button.scss";
type ButtonProps = {
    children: React.ReactNode,
    style?: 'primary' | 'secondary',
    onClick?: () => void;
    type?: "submit" | "reset" | "button"
    form?: string | undefined;
    className?: string;
};
export const Button = ({children, onClick, style, type = "button", form, className = ''}: ButtonProps) => {
    const getClassName = () => {
        switch (style) {
            case "primary":
                return "btn-primary";
            case "secondary":
                return "btn-secondary";
            default:
                return "";
        }
    }

    return (<button form={form} type={type} className={`${getClassName()} ${className}`} onClick={onClick}>
        {children}
    </button>);
}
