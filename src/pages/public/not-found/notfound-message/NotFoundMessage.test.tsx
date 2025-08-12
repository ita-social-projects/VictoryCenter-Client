import { render } from '@testing-library/react';
import { NotFoundMessage } from './NotFoundMessage';
import { MemoryRouter } from 'react-router';

describe('NotFoundMessage', () => {
    it('renders the component', () => {
        const { container } = render(
            <MemoryRouter>
                <NotFoundMessage />
            </MemoryRouter>,
        );
        const pageContainer = container.querySelector('.not-found-message-container');
        const pageText = container.querySelector('.not-found-message-text');
        const pageDescription = container.querySelector('.not-found-message-description');

        expect(pageContainer).toBeInTheDocument();
        expect(pageText).toBeInTheDocument();
        expect(pageDescription).toBeInTheDocument();
    });
});
