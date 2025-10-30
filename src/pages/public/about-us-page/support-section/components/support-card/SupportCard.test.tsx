import { render, screen } from '@testing-library/react';
import { SupportCard } from './SupportCard';
import { ContentType } from '../../../../../../types/common/about-us';
import { AboutUsContent } from '../../../../../../types/public/about-us-page';
import { aboutUsPageUk } from '../../../../../../locales/uk';

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

    test('renders image with correct src and alt', () => {
        render(<SupportCard card={card} />);
        const image = screen.getByRole('img');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', card.image!.url);
        expect(image).toHaveAttribute('alt', aboutUsPageUk.SUPPORT_DATA[0].ALT);
    });

    test('renders description text', () => {
        render(<SupportCard card={card} />);
        expect(screen.getByText(card.description!)).toBeInTheDocument();
    });

    test('applies correct class based on index', () => {
        render(<SupportCard card={card} />);
        const div = screen.getByRole('img').closest('div');
        expect(div).toHaveClass('support-card');
        expect(div).toHaveClass(`card-1`);
    });

    test('renders correctly for multiple indexes', () => {
        const { rerender } = render(<SupportCard card={card} index={1} />);
        const card2 = screen.getByRole('img').closest('div');
        expect(card2).toHaveClass('card-2');

        rerender(<SupportCard card={card} index={2} />);
        const card4 = screen.getByRole('img').closest('div');
        expect(card4).toHaveClass('card-3');
    });
});
