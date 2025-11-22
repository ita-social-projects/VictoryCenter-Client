import React, { useState, useRef, useCallback, useId } from 'react';
import { ReactComponent as InfoIcon } from '../../../assets/icons/info.svg';
import { Tooltip, TooltipPosition } from '../tooltip/Tooltip';
import { useOnClickOutside } from '../../../hooks/common/use-on-click-outside/useOnClickOutside';
import styles from './ButtonTooltip.module.scss';

export interface ButtonTooltipProps {
    children: React.ReactNode;
    position?: TooltipPosition;
}

export const ButtonTooltip = ({ children, position = 'bottom' }: ButtonTooltipProps) => {
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
            className={styles['button-tooltip-wrapper']}
            onClick={toggleTooltip}
            aria-haspopup="true"
            aria-expanded={isVisible}
            aria-label="Show additional information"
            aria-describedby={isVisible ? tooltipId : undefined}
        >
            <InfoIcon className={styles['button-tooltip-icon']} />

            {isVisible && (
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
            )}
        </button>
    );
};
