import { HippotherapyIntro } from './HippotherapyIntro';
import { render, screen } from '@testing-library/react';

describe('HippotherapyIntro', () => {
    it('should render intro section with provided data', () => {
        const props = {
            imgURL: 'test-image.jpg',
            imgAlternativeText: 'Test Image',
            title: 'Test Title',
            description: 'Test Description',
        };
        render(<HippotherapyIntro {...props} />);

        const image = screen.getByRole('img');
        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', 'test-image.jpg');
        expect(image).toHaveAttribute('alt', 'Test Image');
        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Test Description')).toBeInTheDocument();
    });
});
