import React, { useState, useRef, useEffect, useCallback, useId } from 'react';
import InfoIcon from '../../../assets/icons/info.svg';
import classNames from 'classnames';
import './ButtonTooltip.scss';

export interface ButtonTooltipProps {
    children: React.ReactNode;
    offset?: number;
    position?: 'top' | 'bottom';
}

export const ButtonTooltip = ({ children, position = 'bottom', offset = 8 }: ButtonTooltipProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
    const wrapperRef = useRef<HTMLButtonElement>(null);
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
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target as Node) &&
                tooltipRef.current &&
                !tooltipRef.current.contains(event.target as Node)
            ) {
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

    const tooltipId = useId();

    return (
        <button
            ref={wrapperRef}
            className="button-tooltip-wrapper"
            onClick={toggleTooltip}
            type="button"
            aria-haspopup="true"
            aria-expanded={isVisible}
            aria-label="Show additional information"
            aria-describedby={isVisible ? tooltipId : undefined}
        >
            <img className="button-tooltip-icon" src={InfoIcon} alt="tooltip icon" />

            {isVisible && (
                <div
                    id={tooltipId}
                    ref={tooltipRef}
                    role="tooltip"
                    className={classNames('button-tooltip-popup', `button-tooltip-popup--${position}`)}
                    style={{
                        top: `${tooltipPosition.top}px`,
                        left: `${tooltipPosition.left}px`,
                    }}
                >
                    {children}
                </div>
            )}
        </button>
    );
};
