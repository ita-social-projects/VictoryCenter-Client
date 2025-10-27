import { render, screen } from '@testing-library/react';
import { SupportCard } from './SupportCard';

describe('SupportCard component', () => {
    const mockProps = {
        IMG: '/images/support1.png',
        ALT: 'Support Image',
        DESCRIPTION: 'We provide great support!',
        index: 0,
    };

    test('renders image with correct src and alt', () => {
        render(<SupportCard {...mockProps} />);
        const image = screen.getByRole('img', { name: mockProps.ALT });
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', mockProps.IMG);
        expect(image).toHaveAttribute('alt', mockProps.ALT);
    });

    test('renders description text', () => {
        render(<SupportCard {...mockProps} />);
        expect(screen.getByText(mockProps.DESCRIPTION)).toBeInTheDocument();
    });

    test('applies correct class based on index', () => {
        render(<SupportCard {...mockProps} />);
        const card = screen.getByRole('img', { name: mockProps.ALT }).closest('div');
        expect(card).toHaveClass('support-card');
        expect(card).toHaveClass(`card-${mockProps.index + 1}`);
    });

    test('renders correctly for multiple indexes', () => {
        const { rerender } = render(<SupportCard {...mockProps} index={1} />);
        const card2 = screen.getByRole('img', { name: mockProps.ALT }).closest('div');
        expect(card2).toHaveClass('card-2');

        rerender(<SupportCard {...mockProps} index={3} />);
        const card4 = screen.getByRole('img', { name: mockProps.ALT }).closest('div');
        expect(card4).toHaveClass('card-4');
    });
});
