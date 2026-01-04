import React, { ButtonHTMLAttributes, AnchorHTMLAttributes, memo } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import cn from 'classnames';
import { isExternalLink } from '@/utils/functions/url';
import styles from './Button.module.scss';

export type ButtonVariant = 'primary-dark' | 'primary-light' | 'secondary-dark' | 'secondary-light' | 'tertiary';
export type ButtonSize = 'medium' | 'large';
export type ButtonType = 'button' | 'submit' | 'reset';
export type ButtonIconPosition = 'left' | 'right';
export type ButtonIcon = React.FunctionComponent<React.SVGProps<SVGSVGElement>>;

interface BaseButtonProps {
    variant?: ButtonVariant;
    size?: ButtonSize;
    type?: ButtonType;
    href?: string;
    disabled?: boolean;
    className?: string;
    onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
}

interface StandardButtonProps extends BaseButtonProps {
    children: React.ReactNode;
    icon?: ButtonIcon;
    iconPosition?: ButtonIconPosition;
    ariaLabel?: string;
}

interface IconButtonProps extends BaseButtonProps {
    children?: never;
    icon: ButtonIcon;
    ariaLabel: string;
    iconPosition?: never;
}

type ControlledKeys = keyof BaseButtonProps | 'children' | 'icon' | 'iconPosition' | 'ariaLabel';

type NativeButtonAttributes = Omit<ButtonHTMLAttributes<HTMLButtonElement>, ControlledKeys>;
type NativeAnchorAttributes = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, ControlledKeys>;

export type ButtonProps = (StandardButtonProps | IconButtonProps) & (NativeButtonAttributes | NativeAnchorAttributes);

export const Button = memo((props: ButtonProps) => {
    const {
        variant = 'primary-dark',
        size = 'medium',
        type = 'button',
        disabled = false,
        href,
        ariaLabel,
        children,
        className,
        onClick,
        icon: Icon,
        iconPosition = 'left',
        ...restProps
    } = props;
    const isIconButton = !children;
    const position = isIconButton ? 'only' : Icon ? iconPosition : undefined;

    const rootClasses = cn(styles.button, styles[variant], styles[size], { [styles.disabled]: disabled }, className);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => {
        if (disabled) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        onClick?.(e);
    };

    const renderContent = () => {
        if (isIconButton && Icon) {
            return <Icon className={styles.icon} aria-label={ariaLabel} />;
        }

        return (
            <span className={styles.content} data-icon-position={position}>
                {Icon && position === 'left' && <Icon className={styles.icon} />}
                <span>{children}</span>
                {Icon && position === 'right' && <Icon className={styles.icon} />}
            </span>
        );
    };

    const commonAttributes = {
        className: rootClasses,
        'aria-label': isIconButton ? ariaLabel : undefined,
        'data-icon-position': position,
        onClick: handleClick,
        ...(disabled && { 'aria-disabled': true, tabIndex: -1 }),
    };

    if (href) {
        const anchorProps = restProps as NativeAnchorAttributes;

        return isExternalLink(href) ? (
            <a href={href} target="_blank" rel="noopener noreferrer" {...commonAttributes} {...anchorProps}>
                {renderContent()}
            </a>
        ) : (
            <Link to={href} {...commonAttributes} {...(anchorProps as Omit<LinkProps, 'to'>)}>
                {renderContent()}
            </Link>
        );
    }

    return (
        <button type={type} disabled={disabled} {...commonAttributes} {...(restProps as NativeButtonAttributes)}>
            {renderContent()}
        </button>
    );
});

Button.displayName = 'Button';
