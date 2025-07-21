import React, { useState, useRef, useEffect } from 'react';
import InfoIcon from '../../../assets/icons/info.svg';
import InfoIconActive from '../../../assets/icons/info-active.svg';
import classNames from 'classnames';
import './button-tooltip.scss';

export type ButtonTooltipProps = {
    children: React.ReactNode;
    className?: string;
    offset?: number;
    position?: 'top' | 'bottom';
};

export const ButtonTooltip = ({
    children,
    className,
    position = 'bottom',
    offset = 8,
}: ButtonTooltipProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const wrapperRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const toggleTooltip = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsVisible((prev) => !prev);
    };

    const hideTooltip = () => {
        setIsVisible(false);
    };

    const calculatePosition = () => {
        if (!wrapperRef.current || !tooltipRef.current) return;

        const wrapperWidth = wrapperRef.current.offsetWidth;
        const wrapperHeight = wrapperRef.current.offsetHeight;
        const tooltipWidth = tooltipRef.current.offsetWidth;
        const tooltipHeight = tooltipRef.current.offsetHeight;

        let top = 0;

        const left = (wrapperWidth - tooltipWidth) / 2;

        switch (position) {
            case 'top':
                top = -tooltipHeight - offset;
                break;
            case 'bottom':
                top = wrapperHeight + offset;
                break;
        }

        setTooltipPosition({ top, left });
    };

    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                calculatePosition();
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [isVisible]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                hideTooltip();
            }
        };

        if (isVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isVisible]);

    const handleTooltipClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div
            ref={wrapperRef}
            className={classNames('button-tooltip-wrapper', className)}
            onClick={toggleTooltip}
        >
            <img className="button-tooltip-icon"
                 src={isVisible ? InfoIconActive : InfoIcon}
                 alt="info"/>

            {isVisible && (
                <div
                    ref={tooltipRef}
                    className={classNames('button-tooltip-popup', `button-tooltip-popup--${position}`)}
                    style={{
                        top: `${tooltipPosition.top}px`,
                        left: `${tooltipPosition.left}px`,
                    }}
                    onClick={handleTooltipClick}
                >
                    {children}
                </div>
            )}
        </div>
    );
};

export default ButtonTooltip;
