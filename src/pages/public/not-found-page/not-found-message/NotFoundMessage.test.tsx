import { render } from '@testing-library/react';
import { NotFoundMessage } from './NotFoundMessage';
import { MemoryRouter } from 'react-router-dom';

jest.mock('./NotFoundMessage.module.scss', () => ({
    root: 'root-class',
    header: 'header-class',
    title: 'title-class',
    content: 'content-class',
    description: 'description-class',
    actions: 'actions-class',
}));

describe('NotFoundMessage', () => {
    it('renders the component', () => {
        const { container } = render(
            <MemoryRouter>
                <NotFoundMessage />
            </MemoryRouter>,
        );
        const pageContainer = container.querySelector('.root-class');
        const pageText = container.querySelector('.title-class');
        const pageDescription = container.querySelector('.description-class');

        expect(pageContainer).toBeInTheDocument();
        expect(pageText).toBeInTheDocument();
        expect(pageDescription).toBeInTheDocument();
    });
});
