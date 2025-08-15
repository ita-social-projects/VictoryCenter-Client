import React, { useState, useRef, useCallback, useId } from 'react';
import InfoIcon from '../../../assets/icons/info.svg';
import { Tooltip, TooltipPosition } from '../tooltip/Tooltip';
import { useOnClickOutside } from '../../../hooks/common/use-on-click-outside/useOnClickOutside';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';
import './ButtonTooltip.scss';

export interface ButtonTooltipProps {
    children: React.ReactNode;
    position?: TooltipPosition;
}

export const ButtonTooltip = ({ children, position = 'bottom' }: ButtonTooltipProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const wrapperRef = useRef<HTMLButtonElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const tooltipId = useId();

    const toggleTooltip = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsVisible((prev) => !prev);
    };

    const closeTooltip = useCallback(() => {
        setIsVisible(false);
    }, []);

    useOnClickOutside({
        ignoreClickRefs: [wrapperRef],
        onOutsideClick: closeTooltip,
        enabledWhen: isVisible,
    });

    return (
        <button
            ref={wrapperRef}
            type="button"
            className="button-tooltip-wrapper"
            onClick={toggleTooltip}
            aria-haspopup="true"
            aria-expanded={isVisible}
            aria-label="Show additional information"
            aria-describedby={isVisible ? tooltipId : undefined}
        >
            <img
                className="button-tooltip-icon"
                src={InfoIcon}
                alt={isVisible ? COMMON_TEXT_ADMIN.ALT.HIDE_TOOLTIP : COMMON_TEXT_ADMIN.ALT.SHOW_TOOLTIP}
            />

            {isVisible && (
                <Tooltip
                    ref={tooltipRef}
                    id={tooltipId}
                    position={position}
                    offsetInPixels={8}
                    customMaxWidthInPixels={400}
                    allowClickThrough={true}
                    isCentered={true}
                    children={children}
                />
            )}
        </button>
    );
};
