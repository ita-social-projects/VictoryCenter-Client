import { render, screen } from '@testing-library/react';
import { NotFound } from './NotFound';
jest.mock('./notfound-page-intro/NotFoundIntro', () => ({
    NotFoundIntro: () => <div data-testid="not-found-page-intro-container">NotFoundIntro</div>,
}));

jest.mock('./notfound-footer/NotFoundFooter', () => ({
    NotFoundFooter: () => <div data-testid="not-found-footer-container">NotFoundFooter</div>,
}));

describe('NotFound', () => {
    it('renders the component', () => {
        const { container } = render(<NotFound />);
        const pageContainer = container.querySelector('.not-found-page-container');
        expect(screen.getByTestId('intro-section')).toBeInTheDocument();
        expect(screen.getByTestId('program-section')).toBeInTheDocument();
        expect(pageContainer).toBeInTheDocument();
    });
});
