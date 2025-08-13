import { render, screen } from '@testing-library/react';
import { NotFound } from './NotFound';
jest.mock('./notfound-intro/NotFoundIntro', () => ({
    NotFoundIntro: () => <div data-testid="not-found-page-intro-container">NotFoundIntro</div>,
}));

jest.mock('./notfound-message/NotFoundMessage', () => ({
    NotFoundMessage: () => <div data-testid="not-found-message-container">NotFoundMessage</div>,
}));

describe('NotFound', () => {
    it('renders the component', () => {
        const { container } = render(<NotFound />);
        const pageContainer = container.querySelector('.not-found-page-container');
        expect(screen.getByTestId('not-found-page-intro-container')).toBeInTheDocument();
        expect(screen.getByTestId('not-found-message-container')).toBeInTheDocument();
        expect(pageContainer).toBeInTheDocument();
    });
});
