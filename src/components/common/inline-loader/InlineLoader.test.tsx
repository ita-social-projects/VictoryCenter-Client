import { render, screen } from '@testing-library/react';
import { InlineLoader } from './InlineLoader';
import { LOADER_TEXT } from '../../../const/common/common';

jest.mock('../../../assets/icons/load.svg', () => ({
    ReactComponent: (props: any) => <svg {...props} data-testid="loader-icon" />,
}));

describe('InlineLoader', () => {
    it('renders with default size', () => {
        render(<InlineLoader />);
        const img = screen.getByTestId('loader-icon');
        expect(img).toBeInTheDocument();
        expect(img).toHaveClass('loader');
        expect(img).toHaveStyle({ width: '2rem', height: '2rem' });
    });

    it('renders with custom size', () => {
        render(<InlineLoader size={3} />);
        const img = screen.getByTestId('loader-icon');
        expect(img).toHaveStyle({ width: '3rem', height: '3rem' });
    });
});
