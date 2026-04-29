import { render, screen } from '@testing-library/react';
import { ResearchSection } from './ResearchSection';

describe('ResearchSection', () => {
    const props = {
        title: 'Test Research Title',
        description: 'Test research description',
        researches: [
            { text: 'Research 1', url: 'http://example.com/research1' },
            { text: 'Research 2', url: 'http://example.com/research2' },
        ],
    };
    it('should render title, description and research links', () => {
        render(<ResearchSection {...props} />);
        expect(screen.getByText('Test Research Title')).toBeInTheDocument();
        expect(screen.getByText('Test research description')).toBeInTheDocument();
        expect(screen.getByText('Research 1')).toBeInTheDocument();
        expect(screen.getByText('Research 2')).toBeInTheDocument();
        expect(screen.getByText('Research 1').closest('a')).toHaveAttribute('href', 'http://example.com/research1');
        expect(screen.getByText('Research 2').closest('a')).toHaveAttribute('href', 'http://example.com/research2');
    });
});
