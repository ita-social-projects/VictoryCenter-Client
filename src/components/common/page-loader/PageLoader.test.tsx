import { render, screen } from '@testing-library/react';
import { PageLoader } from './PageLoader';
import { LOADER_ALT } from '../../../const/loader/loader';

describe('PageLoader', () => {
    it('renders a full-page wrapper with the correct class', () => {
        const { container } = render(<PageLoader />);
        const wrapper = container.querySelector('.full-page-loader');
        expect(wrapper).toBeInTheDocument();
    });

    it('renders a logo with the correct class', () => {
        render(<PageLoader />);
        const img = screen.getByAltText(LOADER_ALT);
        expect(img).toBeInTheDocument();
        expect(img).toHaveClass('loader-icon');
    });
});
