import { render, screen } from '@testing-library/react';
import { HintBox } from './HintBox';

jest.mock('../../../assets/icons/info.svg', () => 'mocked-info-icon.svg');

describe('HintBox', () => {
    it('renders title and icon', () => {
        const title = 'Test title';
        render(<HintBox title={title} />);

        expect(screen.getByText(title)).toBeInTheDocument();
        expect(screen.getByAltText('hint-icon')).toBeInTheDocument();
    });

    it('renders title and text when text is provided', () => {
        const title = 'Test title';
        const text = 'Test hint-box text';
        render(<HintBox title={title} text={text} />);

        expect(screen.getByText(title)).toBeInTheDocument();
        expect(screen.getByText(text)).toBeInTheDocument();
    });

    it('does not render additional text when text is not provided', () => {
        const title = 'Test title';
        render(<HintBox title={title} />);

        expect(screen.getByText(title)).toBeInTheDocument();
        const container = screen.getByText(title).closest('.hint-box');
        expect(container?.children).toHaveLength(1);
    });

    it('has correct CSS classes', () => {
        const title = 'Test title';
        render(<HintBox title={title} />);

        const container = screen.getByText(title).closest('.hint-box');
        const titleContainer = screen.getByText(title).parentElement;

        expect(container).toBeInTheDocument();
        expect(titleContainer).toHaveClass('hint-box-title');
    });

    it('icon has correct src and alt attributes', () => {
        const title = 'Test title';
        render(<HintBox title={title} />);

        const icon = screen.getByAltText('hint-icon') as HTMLImageElement;
        expect(icon.src).toContain('mocked-info-icon.svg');
        expect(icon.alt).toBe('hint-icon');
    });

    it('renders empty text correctly', () => {
        const title = 'Title';
        const text = '';
        render(<HintBox title={title} text={text} />);

        expect(screen.getByText(title)).toBeInTheDocument();

        const container = screen.getByText(title).closest('.hint-box');
        expect(container?.children).toHaveLength(1);
    });
});
