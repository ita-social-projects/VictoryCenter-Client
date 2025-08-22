import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { TextSearchItem, TextSearchItemProps } from './TextSearchItem';
import { SearchItemContentRef } from '../search-item-wrapper/SearchItemWrapper';

const defaultProps: TextSearchItemProps = {
    label: 'Default Label',
};

const renderComponent = (props: Partial<TextSearchItemProps> = {}) => {
    const finalProps: TextSearchItemProps = { ...defaultProps, ...props };
    const ref = createRef<SearchItemContentRef>();

    const view = render(<TextSearchItem {...finalProps} ref={ref} />);

    return { ref, ...view };
};

describe('TextSearchItem', () => {
    it('should render the label correctly', () => {
        const testLabel: string = 'My Test Label';
        renderComponent({ label: testLabel });

        expect(screen.getByText(testLabel)).toBeInTheDocument();
    });

    it('should return null for tooltip when content does not overflow', () => {
        const { ref } = renderComponent();
        const element: HTMLElement = screen.getByText(defaultProps.label);

        Object.defineProperty(element, 'scrollWidth', { value: 100 });
        Object.defineProperty(element, 'clientWidth', { value: 100 });

        const tooltipContent = ref.current?.getTooltipContent();

        expect(tooltipContent).toBeNull();
    });

    it('should return tooltip content when content overflows', () => {
        const testLabel: string = 'This is a very long label that will definitely overflow';
        const { ref } = renderComponent({ label: testLabel });
        const element: HTMLElement = screen.getByText(testLabel);

        Object.defineProperty(element, 'scrollWidth', { value: 200 });
        Object.defineProperty(element, 'clientWidth', { value: 100 });

        const tooltipContent = ref.current?.getTooltipContent() as React.ReactElement | null;

        expect(tooltipContent).not.toBeNull();
        expect(React.isValidElement(tooltipContent)).toBe(true);

        // @ts-ignore
        expect(tooltipContent?.props.className).toBe('text-suggestion-content__tooltip');
        // @ts-ignore
        expect(tooltipContent?.props.children).toBe(testLabel);
    });
});
