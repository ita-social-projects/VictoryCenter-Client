import { render, screen } from '@testing-library/react';
import { SupportCard } from './SupportCard';

describe('SupportCard component', () => {
    const mockProps = {
        img: '/images/support1.png',
        alt: 'Support Image',
        description: 'We provide great support!',
        index: 0,
    };

    test('renders image with correct src and alt', () => {
        render(<SupportCard {...mockProps} />);
        const image = screen.getByRole('img', { name: mockProps.alt });
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', mockProps.img);
        expect(image).toHaveAttribute('alt', mockProps.alt);
    });

    test('renders description text', () => {
        render(<SupportCard {...mockProps} />);
        expect(screen.getByText(mockProps.description)).toBeInTheDocument();
    });

    test('applies correct class based on index', () => {
        render(<SupportCard {...mockProps} />);
        const card = screen.getByRole('img', { name: mockProps.alt }).closest('div');
        expect(card).toHaveClass('support-card');
        expect(card).toHaveClass(`card-${mockProps.index + 1}`);
    });

    test('renders correctly for multiple indexes', () => {
        const { rerender } = render(<SupportCard {...mockProps} index={1} />);
        const card2 = screen.getByRole('img', { name: mockProps.alt }).closest('div');
        expect(card2).toHaveClass('card-2');

        rerender(<SupportCard {...mockProps} index={3} />);
        const card4 = screen.getByRole('img', { name: mockProps.alt }).closest('div');
        expect(card4).toHaveClass('card-4');
    });
});
