import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { TextSuggestionContent } from '../text-suggestion-content/TextSuggestionContent';
import classNames from 'classnames';
import './SuggestionWrapper.scss';

export interface SuggestionContentRef {
    getTooltipContent: () => React.ReactNode | null;
}

export interface SuggestionContentRenderProps<T> {
    item: T;
    isSuggestionActive: boolean;
    isSuggestionHovered: boolean;
}

export type SuggestionWrapperRef = SuggestionContentRef;

export interface SuggestionWrapperProps<T> {
    item: T;
    isActive: boolean;
    onSelect: () => void;
    onHover: (element: HTMLLIElement) => void;
    getItemLabel: (item: T) => string;
    renderContent?: React.ForwardRefExoticComponent<
        SuggestionContentRenderProps<T> & React.RefAttributes<SuggestionContentRef>
    >;
    onMouseLeave?: () => void;
}

function SuggestionWrapperInner<T>(
    {
        item,
        isActive,
        onSelect,
        onHover,
        onMouseLeave,
        renderContent: RenderContentComponent,
        getItemLabel,
    }: SuggestionWrapperProps<T>,
    ref: React.Ref<SuggestionWrapperRef>,
) {
    const [isHovered, setIsHovered] = useState(false);
    const liRef = useRef<HTMLLIElement>(null);
    const contentRef = useRef<SuggestionContentRef>(null);

    useImperativeHandle(ref, () => ({
        getTooltipContent: () => contentRef.current?.getTooltipContent() ?? null,
    }));

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (liRef.current) {
            onHover?.(liRef.current);
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        onMouseLeave?.();
    };

    const contentProps: SuggestionContentRenderProps<T> = {
        item,
        isSuggestionActive: isActive,
        isSuggestionHovered: isHovered,
    };

    return (
        <li
            ref={liRef}
            className={classNames('suggestion-wrapper', {
                'suggestion-wrapper--active': isActive || isHovered,
            })}
            onClick={onSelect}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {RenderContentComponent ? (
                <RenderContentComponent {...contentProps} ref={contentRef} />
            ) : (
                <TextSuggestionContent label={getItemLabel(item)} ref={contentRef} />
            )}
        </li>
    );
}

export const SuggestionWrapper = forwardRef(SuggestionWrapperInner) as <T>(
    props: SuggestionWrapperProps<T> & {
        ref?: React.Ref<SuggestionWrapperRef>;
    },
) => React.ReactElement;
