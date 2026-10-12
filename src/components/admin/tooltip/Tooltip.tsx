import React, { useState, useCallback, useLayoutEffect, useRef } from 'react';
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

export interface TooltipWithoutPortal extends TooltipBaseProps {
    isRenderInPortal?: false;
    portalPositioner?: never;
}

export interface TooltipWithPortal extends TooltipBaseProps {
    isRenderInPortal: true;
    portalPositioner: Element;
}

export type TooltipProps = TooltipWithoutPortal | TooltipWithPortal;

interface TooltipCoordinates {
    top: number;
    left: number;
    position: TooltipPosition;
}

export const Tooltip = ({
    id,
    children,
    position = 'bottom',
    offsetInPixels = 8,
    customMaxWidthInPixels,
    isCentered = false,
    isRenderInPortal = false,
    allowClickThrough = false,
    portalPositioner,
}: TooltipProps) => {
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [tooltipPosition, setTooltipPosition] = useState<TooltipCoordinates>({ top: 0, left: 0, position });

    const calculatePosition = useCallback(() => {
        const tooltipElement = tooltipRef.current;
        if (!tooltipElement) return;

        if (isRenderInPortal && portalPositioner) {
            const positionerRect = portalPositioner.getBoundingClientRect();
            const tooltipWidth = tooltipElement.offsetWidth;
            const tooltipHeight = tooltipElement.offsetHeight;

            const availableSpaceAbove = positionerRect.top - offsetInPixels;
            const availableSpaceBelow = window.innerHeight - positionerRect.bottom - offsetInPixels;
            const shouldFlipToTop =
                position === 'bottom' &&
                tooltipHeight > availableSpaceBelow &&
                (tooltipHeight <= availableSpaceAbove || availableSpaceAbove > availableSpaceBelow);
            const shouldFlipToBottom =
                position === 'top' &&
                tooltipHeight > availableSpaceAbove &&
                (tooltipHeight <= availableSpaceBelow || availableSpaceBelow > availableSpaceAbove);
            const resolvedPosition = shouldFlipToTop ? 'top' : shouldFlipToBottom ? 'bottom' : position;

            let top = 0;
            let left = isCentered
                ? positionerRect.left + (positionerRect.width - tooltipWidth) / 2
                : positionerRect.left;

            switch (resolvedPosition) {
                case 'top':
                    top = positionerRect.top - tooltipHeight - offsetInPixels;
                    break;
                case 'bottom':
                    top = positionerRect.bottom + offsetInPixels;
                    break;
            }

            setTooltipPosition((previousPosition) =>
                previousPosition.top === top &&
                previousPosition.left === left &&
                previousPosition.position === resolvedPosition
                    ? previousPosition
                    : { top, left, position: resolvedPosition },
            );
        } else {
            const parentElement = tooltipElement.parentElement as HTMLElement;
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

            setTooltipPosition((previousPosition) =>
                previousPosition.top === top && previousPosition.left === left && previousPosition.position === position
                    ? previousPosition
                    : { top, left, position },
            );
        }
    }, [position, offsetInPixels, isCentered, isRenderInPortal, portalPositioner]);

    useLayoutEffect(() => {
        calculatePosition();

        if (isRenderInPortal) {
            window.addEventListener('resize', calculatePosition);
            window.addEventListener('scroll', calculatePosition, true);

            return () => {
                window.removeEventListener('resize', calculatePosition);
                window.removeEventListener('scroll', calculatePosition, true);
            };
        }
    }, [calculatePosition, isRenderInPortal]);

    const tooltipContent = (
        <div
            id={id}
            ref={tooltipRef}
            role="tooltip"
            onMouseDown={(e) => e.stopPropagation()}
            className={classNames('tooltip-popup', `tooltip-popup--${tooltipPosition.position}`)}
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
};
