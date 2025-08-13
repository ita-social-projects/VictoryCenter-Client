import { render } from '@testing-library/react';
import { NotFoundIntro } from './NotFoundIntro';

describe('NotFoundIntro', () => {
    it('renders the component', () => {
        const { container } = render(<NotFoundIntro />);
        const pageContainer = container.querySelector('.not-found-page-intro-container');
        const pageContent = container.querySelector('.not-found-page-intro-content');

        expect(pageContainer).toBeInTheDocument();
        expect(pageContent).toBeInTheDocument();
    });
});
