import React from 'react';
import { render, screen } from '@testing-library/react';
import { FaqSearchItem } from './FaqSearchItem';

const mockItem = {
    id: 1,
    question: 'What is Victory Center?',
    pages: ['Home', 'About'], // лишаємо в мокові, але UI їх не показує
};

describe('FaqSearchItem', () => {
    it('renders only question', () => {
        render(<FaqSearchItem item={mockItem} />);

        expect(screen.getByText('What is Victory Center?')).toBeInTheDocument();
        expect(screen.queryByText('Home, About')).not.toBeInTheDocument();
    });

    it('returns tooltip content when overflowing', () => {
        const ref = React.createRef<any>();
        const { container } = render(<FaqSearchItem item={mockItem} ref={ref} />);

        const nameEl = container.querySelector('.faq-search-item__name') as HTMLSpanElement;

        Object.defineProperty(nameEl, 'scrollWidth', { value: 200, configurable: true });
        Object.defineProperty(nameEl, 'clientWidth', { value: 100, configurable: true });

        const content = ref.current!.getTooltipContent();

        expect(content).not.toBeNull();
        expect(content.type).toBe('div');
        expect(content.props.className).toBe('faq-search-item-tooltip');
        expect(content.props.children.props.children).toBe('What is Victory Center?');
    });

    it('returns null for tooltip content when not overflowing', () => {
        const ref = React.createRef<any>();
        render(<FaqSearchItem item={mockItem} ref={ref} />);

        expect(ref.current).toBeTruthy();
        expect(ref.current.getTooltipContent()).toBeNull();
    });
});
