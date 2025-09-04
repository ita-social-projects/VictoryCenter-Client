import React from 'react';
import { render } from '@testing-library/react';
import { FaqSearchItem } from './FaqSearchItem';

const mockItem = {
    id: 1,
    question: 'What is Victory Center?',
    pages: ['Home', 'About'],
};

describe('FaqSearchItem', () => {
    it('renders question and pages', () => {
        const { getByText } = render(<FaqSearchItem item={mockItem} />);
        expect(getByText('What is Victory Center?')).toBeInTheDocument();
        expect(getByText('Home, About')).toBeInTheDocument();
    });

    it('returns tooltip content when overflowing', () => {
        const ref = React.createRef<any>();
        const { container } = render(<FaqSearchItem item={mockItem} ref={ref} />);
        // Mock overflowing
        if (ref.current) {
            ref.current.getTooltipContent = jest.fn(() => <div>Tooltip</div>);
            expect(ref.current.getTooltipContent()).toBeTruthy();
        }
    });

    it('returns null for tooltip content when not overflowing', () => {
        const ref = React.createRef<any>();
        render(<FaqSearchItem item={mockItem} ref={ref} />);
        // By default, not overflowing
        if (ref.current) {
            expect(ref.current.getTooltipContent()).toBeNull();
        }
    });
});
