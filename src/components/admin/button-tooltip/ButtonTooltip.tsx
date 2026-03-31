import React, { useState, useRef, useCallback, useId } from 'react';
import { ReactComponent as InfoIcon } from '@/assets/icons/info.svg';
import { Tooltip, TooltipPosition } from '../tooltip/Tooltip';
import { useOnClickOutside } from '@/hooks/common/use-on-click-outside/useOnClickOutside';
import './ButtonTooltip.scss';

export interface ButtonTooltipProps {
    children: React.ReactNode;
    position?: TooltipPosition;
    isRenderInPortal?: boolean;
}

export const ButtonTooltip = ({ children, position = 'bottom', isRenderInPortal = false }: ButtonTooltipProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const wrapperRef = useRef<HTMLButtonElement>(null);
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
        isDisabled: !isVisible,
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
            <InfoIcon className="button-tooltip-icon" />

            {isVisible &&
                (isRenderInPortal && wrapperRef.current ? (
                    <Tooltip
                        id={tooltipId}
                        position={position}
                        offsetInPixels={8}
                        customMaxWidthInPixels={400}
                        allowClickThrough={true}
                        isCentered={true}
                        isRenderInPortal={true}
                        portalPositioner={wrapperRef.current}
                    >
                        {children}
                    </Tooltip>
                ) : (
                    <Tooltip
                        id={tooltipId}
                        position={position}
                        offsetInPixels={8}
                        customMaxWidthInPixels={400}
                        allowClickThrough={true}
                        isCentered={true}
                    >
                        {children}
                    </Tooltip>
                ))}
        </button>
    );
};
