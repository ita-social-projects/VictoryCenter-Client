import React from 'react';
import { render, screen } from '@testing-library/react';
import { FaqSearchItem } from './FaqSearchItem';

const mockItem = {
    id: 1,
    question: 'What is Victory Center?',
    pages: ['Home', 'About'],
};

describe('FaqSearchItem', () => {
    it('renders question and pages', () => {
        render(<FaqSearchItem item={mockItem} />);
        expect(screen.getByText('What is Victory Center?')).toBeInTheDocument();
        expect(screen.getByText('Home, About')).toBeInTheDocument();
    });

    it('returns tooltip content when overflowing', () => {
        const ref = React.createRef<any>();
        const { container } = render(<FaqSearchItem item={mockItem} ref={ref} />);
        const nameEl = container.querySelector('.faq-search-item__name') as HTMLSpanElement;
        // Simulate overflow on the name element
        Object.defineProperty(nameEl, 'scrollWidth', { value: 200, configurable: true });
        Object.defineProperty(nameEl, 'clientWidth', { value: 100, configurable: true });

        const content = ref.current!.getTooltipContent();
        expect(content).not.toBeNull();
        expect(content.type).toBe('div');
        expect(content.props.className).toBe('faq-search-item-tooltip');
    });

    it('returns null for tooltip content when not overflowing', () => {
        const ref = React.createRef<any>();
        render(<FaqSearchItem item={mockItem} ref={ref} />);
        // By default, not overflowing
        expect(ref.current).toBeTruthy();
        expect(ref.current.getTooltipContent()).toBeNull();
    });
});
