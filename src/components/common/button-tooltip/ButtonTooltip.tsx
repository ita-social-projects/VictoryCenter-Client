import React, { useState, useRef, useEffect, useCallback } from 'react';
import InfoIcon from '../../../assets/icons/info.svg';
import InfoIconActive from '../../../assets/icons/info-active.svg';
import classNames from 'classnames';
import './button-tooltip.scss';

export interface ButtonTooltipProps {
    children: React.ReactNode;
    offset?: number;
    position?: 'top' | 'bottom';
}

export const ButtonTooltip = ({ children, position = 'bottom', offset = 8 }: ButtonTooltipProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const wrapperRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);

    const toggleTooltip = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsVisible((prev) => !prev);
    };

    const hideTooltip = useCallback(() => {
        setIsVisible(false);
    }, []);

    const calculatePosition = useCallback(() => {
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
    }, [position, offset]);

    useEffect(() => {
        if (isVisible) {
            calculatePosition();
        }
    }, [isVisible, position, offset, calculatePosition]);

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
    }, [isVisible, hideTooltip]);

    const handleTooltipClick = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <div
            ref={wrapperRef}
            className="button-tooltip-wrapper"
            onClick={toggleTooltip}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') toggleTooltip(e as any);
            }}
            aria-haspopup="true"
            aria-expanded={isVisible}
        >
            <img className="button-tooltip-icon" src={isVisible ? InfoIconActive : InfoIcon} alt="tooltip icon" />

            {isVisible && (
                <div
                    ref={tooltipRef}
                    className={classNames('button-tooltip-popup', `button-tooltip-popup--${position}`)}
                    style={{
                        top: `${tooltipPosition.top}px`,
                        left: `${tooltipPosition.left}px`,
                    }}
                    onClick={handleTooltipClick}
                    role="tooltip"
                >
                    {children}
                </div>
            )}
        </div>
    );
};
