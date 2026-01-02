import { render } from '@testing-library/react';
import { NotFoundIntro } from './NotFoundIntro';

jest.mock('./NotFoundIntro.module.scss', () => ({
    root: 'root-class',
    content: 'content-class',
    text: 'text-class',
}));

describe('NotFoundIntro', () => {
    it('renders the component', () => {
        const { container } = render(<NotFoundIntro />);
        const pageContainer = container.querySelector('.root-class');
        const pageContent = container.querySelector('.content-class');

        expect(pageContainer).toBeInTheDocument();
        expect(pageContent).toBeInTheDocument();
    });
});
