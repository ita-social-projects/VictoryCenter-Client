import { render, screen } from '@testing-library/react';
import { EthicalPrinciples } from './EthicalPrinciples';
import { useMediaQuery } from '@/hooks/common/use-media-query/useMediaQuery';

jest.mock('@/hooks/common/use-media-query/useMediaQuery', () => ({
    useMediaQuery: jest.fn(),
}));

const mockedUseMediaQuery = useMediaQuery as jest.Mock;

describe('EthicalPrinciples', () => {
    const props = {
        title: 'Test Title',
        imgURL: 'test-image.jpg',
        imgAlternativeText: 'Test Image',
        text: 'Test text content',
        principles: ['Principle 1', 'Principle 2', 'Principle 3'],
    };

    beforeEach(() => {
        mockedUseMediaQuery.mockReturnValue(false);
    });

    it('should render title, text and principles list', () => {
        render(<EthicalPrinciples {...props} />);
        expect(screen.getByText('Test Title')).toBeInTheDocument();
        expect(screen.getByText('Test text content')).toBeInTheDocument();
        expect(screen.getByText('Principle 1')).toBeInTheDocument();
        expect(screen.getByText('Principle 2')).toBeInTheDocument();
        expect(screen.getByText('Principle 3')).toBeInTheDocument();
        expect(screen.getByAltText('Test Image')).toBeInTheDocument();
    });

    it('should not render image on desktop', () => {
        mockedUseMediaQuery.mockReturnValue(true);
        render(<EthicalPrinciples {...props} />);
        expect(screen.queryByAltText('Test Image')).not.toBeInTheDocument();
        expect(screen.getByText('Test Title')).toBeInTheDocument();
    });
});
