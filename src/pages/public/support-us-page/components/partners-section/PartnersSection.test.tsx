import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { PartnersSection } from './PartnersSection';

describe('PartnersSection', () => {
    test('should render a level 2 heading for the section title', () => {
        render(<PartnersSection />);
        expect(screen.getByRole('heading', { level: 2 })).toBeInTheDocument();
    });

    test('should render three partner items, each with an image and a non-empty caption', () => {
        const { container } = render(<PartnersSection />);

        const items = container.querySelectorAll('.item');
        expect(items).toHaveLength(3);

        const images = screen.getAllByRole('img');
        expect(images).toHaveLength(3);
        images.forEach((image) => expect(image).toHaveAccessibleName());

        const captions = container.querySelectorAll('.caption');
        expect(captions).toHaveLength(3);
        captions.forEach((caption) => expect(caption.textContent?.trim().length).toBeGreaterThan(0));
    });

    test('should have correct class names', () => {
        const { container } = render(<PartnersSection />);
        expect(container.querySelector('.root')).toBeInTheDocument();
        expect(container.querySelector('.list')).toBeInTheDocument();
    });
});
