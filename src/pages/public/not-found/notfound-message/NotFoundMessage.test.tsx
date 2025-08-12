import { render } from '@testing-library/react';
import { NotFoundMessage } from './NotFoundMessage';

describe('NotFoundFooter', () => {
    it('renders the component', () => {
        const { container } = render(<NotFoundMessage />);
        const pageContainer = container.querySelector('.not-found-footer-container');
        const pageText = container.querySelector('.not-found-footer-text');
        const pageDescription = container.querySelector('.not-found-footer-description');

        expect(pageContainer).toBeInTheDocument();
        expect(pageText).toBeInTheDocument();
        expect(pageDescription).toBeInTheDocument();
    });
});
