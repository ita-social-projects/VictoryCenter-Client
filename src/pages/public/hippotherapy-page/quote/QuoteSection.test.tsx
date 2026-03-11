import { render, screen } from '@testing-library/react';
import { QuoteSection } from './QuoteSection';

describe('QuoteSection', () => {
    it('should render quote section with provided data', () => {
        render(
            <QuoteSection
                imgURL="/path/test-image.jpg"
                imgAlternativeText="Test Image"
                text="<p>Test Quote Text<br/>Test Author</p>"
            />
        );

        const image = screen.getByRole('img');
        expect(image).toHaveAttribute('src', '/path/test-image.jpg');
        expect(image).toHaveAttribute('alt', 'Test Image');
        const text = screen.getByTestId('quote-text');
        expect(text).toHaveTextContent('Test Quote Text');
        expect(text).toHaveTextContent('Test Author');
    });
});
