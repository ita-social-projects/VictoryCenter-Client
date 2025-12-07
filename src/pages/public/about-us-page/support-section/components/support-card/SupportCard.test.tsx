import { render, screen } from '@testing-library/react';
import { SupportCard } from './SupportCard';
import { ContentType } from '@app-types/common/about-us';
import { AboutUsContent } from '@app-types/public/about-us-page';
import { aboutUsPageUk } from '@locales/uk';

describe('SupportCard component', () => {
    const card: AboutUsContent = {
        id: 1,
        contentType: ContentType.Card,
        image: {
            id: 1,
            url: 'https://example.com/image.jpg',
            mimeType: 'image/jpeg',
        },
        description: 'This is a support card description.',
        title: null,
    };

    const defaultProps = {
        card: card,
        index: 0,
    };

    it('renders image with correct src and alt', () => {
        render(<SupportCard {...defaultProps} />);
        const image = screen.getByRole('img');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', card.image!.url);
        expect(image).toHaveAttribute('alt', aboutUsPageUk.SUPPORT_DATA[0].ALT);
    });

    it('renders description text', () => {
        render(<SupportCard {...defaultProps} />);
        expect(screen.getByText(card.description!)).toBeInTheDocument();
    });

    it('renders correct classes for multiple indexes', () => {
        const { rerender } = render(<SupportCard card={card} index={0} />);
        const card1 = screen.getByRole('img').closest('div');
        expect(card1).toHaveClass('support-card');
        expect(card1).toHaveClass('card-1');

        rerender(<SupportCard card={card} index={2} />);
        const card3 = screen.getByRole('img').closest('div');
        expect(card3).toHaveClass('support-card');
        expect(card3).toHaveClass('card-3');
    });
});
