import React, { useRef, useCallback, useMemo } from 'react';
import { useObserveElementSize } from '../../../../hooks/common/use-observe-element-size/useObserveElementSize';
import './TextSuggestionContent.scss';

export interface TextSuggestionContentProps {
    label: string;
    isHovered: boolean;
    onShowTooltip: (content: React.ReactNode | null) => void;
}

export const TextSuggestionContent = React.memo(({ label, isHovered, onShowTooltip }: TextSuggestionContentProps) => {
    const textRef = useRef<HTMLSpanElement>(null);

    const tooltipContent = useMemo(() => <div className="text-suggestion-content__tooltip">{label}</div>, [label]);

    const showTooltipIfNeeded = useCallback(() => {
        const element = textRef.current;
        const isLabelOverflowing = element && element.scrollWidth > element.clientWidth;
        onShowTooltip(isLabelOverflowing ? tooltipContent : null);
    }, [onShowTooltip, tooltipContent]);

    useObserveElementSize({
        observableElement: textRef,
        onSizeChanged: showTooltipIfNeeded,
        disableWhen: !isHovered,
    });

    return (
        <span ref={textRef} className="text-suggestion-content">
            {label}
        </span>
    );
});
