import { render } from '@testing-library/react';
import { Header } from './Header';
import { BrowserRouter } from 'react-router';

describe('Header', () => {
    it('renders the component', () => {
        const { container } = render(
            <BrowserRouter>
                <Header />
            </BrowserRouter>
        );

        const logo = container.querySelector('.logo');

        expect(logo).toBeInTheDocument();
    })
});
