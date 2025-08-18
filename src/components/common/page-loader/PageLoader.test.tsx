import { render, screen } from '@testing-library/react';
import { PageLoader } from './PageLoader';
import { LOADER_TEXT } from '../../../const/common/common';

jest.mock('../../../assets/icons/load.svg', () => ({
    ReactComponent: (props: any) => <svg {...props} data-testid="loader-icon" />,
}));

describe('PageLoader', () => {
    it('renders a full-page wrapper with the correct class', () => {
        const { container } = render(<PageLoader />);
        const wrapper = container.querySelector('.full-page-loader');
        expect(wrapper).toBeInTheDocument();
    });

    it('renders a logo with the correct class', () => {
        render(<PageLoader />);
        const icon = screen.getByTestId('loader-icon');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveClass('loader-icon');
        expect(icon).toHaveAttribute('aria-label', LOADER_TEXT.ICON_ALT);
    });
});
