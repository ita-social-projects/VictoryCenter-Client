import React, { ReactNode, useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import './tooltip.scss';

export type TooltipProps = {
    children: React.ReactNode;
    className?: string;
    offset?: number;
    position?: 'top' | 'bottom' | 'left' | 'right';
    delay?: number;
};

export const Tooltip = ({
    children,
    className,
    position = 'bottom',
    offset = 8,
    delay = 200
}: TooltipProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    let triggerContent: ReactNode = null;
    let tooltipContent: ReactNode = null;

    React.Children.forEach(children, (child) => {
        if (React.isValidElement<{ children: ReactNode }>(child)) {
            if (child.type === Tooltip.Trigger) {
                triggerContent = child.props.children;
            } else if (child.type === Tooltip.Content) {
                tooltipContent = child.props.children;
            }
        }
    });

    const showTooltip = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
            calculatePosition();
        }, delay);
    };

    const hideTooltip = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setIsVisible(false);
    };

    const calculatePosition = () => {
        if (!triggerRef.current || !tooltipRef.current) return;

        const triggerRect = triggerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        };

        let top = 0;
        let left = 0;

        switch (position) {
            case 'top':
                top = triggerRect.top - tooltipRect.height - offset;
                left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
                break;
            case 'bottom':
                top = triggerRect.bottom + offset;
                left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
                break;
            case 'left':
                top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
                left = triggerRect.left - tooltipRect.width - offset;
                break;
            case 'right':
                top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
                left = triggerRect.right + offset;
                break;
        }

        // Ensure the tooltip stays within the viewport boundaries
        if (left < 0) left = offset;
        if (left + tooltipRect.width > viewport.width) {
            left = viewport.width - tooltipRect.width - offset;
        }
        if (top < 0) top = offset;
        if (top + tooltipRect.height > viewport.height) {
            top = viewport.height - tooltipRect.height - offset;
        }

        setTooltipPosition({ top, left });
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (isVisible) {
            calculatePosition();
        }
    }, [isVisible, position]);

    return (
        <div
            ref={triggerRef}
            className={classNames('tooltip-wrapper', className)}
            onMouseEnter={showTooltip}
            onMouseLeave={hideTooltip}
        >
            {triggerContent}

            {isVisible && tooltipContent && (
                <div
                    ref={tooltipRef}
                    className={classNames('tooltip-popup', `tooltip-popup--${position}`)}
                    style={{
                        position: 'fixed',
                        top: tooltipPosition.top,
                        left: tooltipPosition.left,
                        zIndex: 1000,
                    }}
                >
                    {tooltipContent}
                </div>
            )}
        </div>
    );
};

type TooltipTriggerProps = {
    children: ReactNode;
};

type TooltipContentProps = {
    children: ReactNode;
};

Tooltip.Trigger = ({ children }: TooltipTriggerProps) => <>{children}</>;
Tooltip.Content = ({ children }: TooltipContentProps) => <>{children}</>;