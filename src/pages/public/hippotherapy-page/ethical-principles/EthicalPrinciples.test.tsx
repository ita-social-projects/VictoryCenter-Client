import { render, screen } from '@testing-library/react';
import { EthicalPrinciples } from './EthicalPrinciples';

describe('EthicalPrinciples', () => {
    const props = {
        title: 'Test Title',
        imgURL: 'test-image.jpg',
        imgAlternativeText: 'Test Image',
        text: 'Test text content',
        principles: ['Principle 1', 'Principle 2', 'Principle 3'],
    };
    it('should render title, text and principles list', () => {
        render(<EthicalPrinciples {...props} />);
        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Test text content')).toBeInTheDocument();
        expect(screen.getByText('Principle 1')).toBeInTheDocument();
        expect(screen.getByText('Principle 2')).toBeInTheDocument();
        expect(screen.getByText('Principle 3')).toBeInTheDocument();
    });
});
