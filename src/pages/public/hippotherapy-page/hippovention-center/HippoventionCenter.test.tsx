import { render, screen } from '@testing-library/react';
import { HippoventionCenter } from './HippoventionCenter';

describe('HippoventionCenter', () => {
    it('should render title, text and pros list', () => {
        const title = 'Test Title';
        const imgURL = 'test-image.jpg';
        const imgAlternativeText = 'Test Image';
        const text = 'Test Text';
        const pros = ['Pro 1', 'Pro 2', 'Pro 3'];
        render(<HippoventionCenter {...{ title, imgURL, imgAlternativeText, text, pros }} />);
        expect(screen.getByText(title)).toBeInTheDocument();
        expect(screen.getByAltText(imgAlternativeText)).toBeInTheDocument();
        expect(screen.getByText(text)).toBeInTheDocument();
        pros.forEach((pro) => {
            expect(screen.getByText(pro)).toBeInTheDocument();
        });
    });
});
