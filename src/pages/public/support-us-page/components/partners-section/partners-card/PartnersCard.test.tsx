import { render, screen } from '@testing-library/react';
import { PartnersCard } from './PartnersCard';

describe('PartnersCard component', () => {
    const defaultProps = {
        imageUrl: 'test.jpg',
        altText: 'Test alt',
        caption: 'Partner caption',
    };

    it('should render the image with the given src and alt', () => {
        render(<PartnersCard {...defaultProps} />);

        const img = screen.getByRole('img');
        expect(img).toHaveAttribute('src', 'test.jpg');
        expect(img).toHaveAttribute('alt', 'Test alt');
    });

    it('should render the caption text', () => {
        render(<PartnersCard {...defaultProps} />);

        expect(screen.getByText('Partner caption')).toBeInTheDocument();
    });
});
