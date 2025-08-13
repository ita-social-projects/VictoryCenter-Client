import React, { useState, useCallback, forwardRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import classNames from 'classnames';
import './Tooltip.scss';

export type TooltipPosition = 'top' | 'bottom';

interface TooltipBaseProps {
    children: React.ReactNode;
    position?: TooltipPosition;
    id?: string;
    isCentered?: boolean;
    offsetInPixels?: number;
    customMaxWidthInPixels?: number;
    allowClickThrough?: boolean;
}

interface TooltipWithoutPortal extends TooltipBaseProps {
    isRenderInPortal?: false;
    portalPositioner?: never;
}

interface TooltipWithPortal extends TooltipBaseProps {
    isRenderInPortal: true;
    portalPositioner: Element;
}

export type TooltipProps = TooltipWithoutPortal | TooltipWithPortal;

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
    (
        {
            id,
            children,
            position = 'bottom',
            offsetInPixels = 8,
            customMaxWidthInPixels,
            isCentered = false,
            isRenderInPortal = false,
            allowClickThrough = false,
            portalPositioner,
        },
        ref,
    ) => {
        const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });

        const calculatePosition = useCallback(() => {
            const tooltipElement = (ref as React.RefObject<HTMLDivElement>)?.current;
            if (!tooltipElement) return;

            if (isRenderInPortal && portalPositioner) {
                const positionerRect = portalPositioner.getBoundingClientRect();
                const tooltipWidth = tooltipElement.offsetWidth;
                const tooltipHeight = tooltipElement.offsetHeight;

                let top = 0;
                let left = isCentered
                    ? positionerRect.left + (positionerRect.width - tooltipWidth) / 2
                    : positionerRect.left;

                switch (position) {
                    case 'top':
                        top = positionerRect.top - tooltipHeight - offsetInPixels;
                        break;
                    case 'bottom':
                        top = positionerRect.bottom + offsetInPixels;
                        break;
                }

                setTooltipPosition({ top, left });
            } else {
                const parentElement = tooltipElement.parentElement as HTMLElement;

                console.log('Parent element: ', parentElement);

                if (!parentElement) return;

                const parentWidth = parentElement.offsetWidth;
                const parentHeight = parentElement.offsetHeight;
                const tooltipWidth = tooltipElement.offsetWidth;
                const tooltipHeight = tooltipElement.offsetHeight;

                let top = 0;
                let left = isCentered ? (parentWidth - tooltipWidth) / 2 : 0;

                switch (position) {
                    case 'top':
                        top = -tooltipHeight - offsetInPixels;
                        break;
                    case 'bottom':
                        top = parentHeight + offsetInPixels;
                        break;
                }

                setTooltipPosition({ top, left });
            }
        }, [position, offsetInPixels, isCentered, isRenderInPortal, portalPositioner]);

        useLayoutEffect(() => {
            calculatePosition();

            if (isRenderInPortal) {
                const handleResize = () => calculatePosition();
                const handleScroll = () => calculatePosition();

                window.addEventListener('resize', handleResize);
                window.addEventListener('scroll', handleScroll, true);

                return () => {
                    window.removeEventListener('resize', handleResize);
                    window.removeEventListener('scroll', handleScroll, true);
                };
            }
        }, [calculatePosition, isRenderInPortal]);

        const tooltipContent = (
            <div
                id={id}
                ref={ref}
                role="tooltip"
                onClick={(e) => e.stopPropagation()}
                className={classNames('tooltip-popup', `tooltip-popup--${position}`)}
                style={{
                    top: `${tooltipPosition.top}px`,
                    left: `${tooltipPosition.left}px`,
                    maxWidth: customMaxWidthInPixels ? `${customMaxWidthInPixels}px` : undefined,
                    position: isRenderInPortal ? 'fixed' : 'absolute',
                    pointerEvents: allowClickThrough ? 'none' : 'auto',
                }}
            >
                {children}
            </div>
        );

        if (isRenderInPortal) {
            return createPortal(tooltipContent, document.body);
        }

        return tooltipContent;
    },
);
