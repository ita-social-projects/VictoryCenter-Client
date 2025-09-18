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
        render(<FaqSearchItem item={mockItem} ref={ref} />);
        // Mock overflowing
        expect(ref.current).toBeTruthy();
        ref.current.getTooltipContent = jest.fn(() => <div>Tooltip</div>);
        expect(ref.current.getTooltipContent()).toBeTruthy();
    });

    it('returns null for tooltip content when not overflowing', () => {
        const ref = React.createRef<any>();
        render(<FaqSearchItem item={mockItem} ref={ref} />);
        // By default, not overflowing
        expect(ref.current).toBeTruthy();
        expect(ref.current.getTooltipContent()).toBeNull();
    });
});
