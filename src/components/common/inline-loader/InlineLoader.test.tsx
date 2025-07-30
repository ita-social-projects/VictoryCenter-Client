import { render, screen } from '@testing-library/react';
import { InlineLoader } from './InlineLoader';
import { LOADER_TEXT } from '../../../const/common/loader';

describe('InlineLoader', () => {
    it('renders with default size', () => {
        render(<InlineLoader />);
        const img = screen.getByAltText(LOADER_TEXT.ICON_ALT);
        expect(img).toBeInTheDocument();
        expect(img).toHaveClass('loader');
        expect(img).toHaveStyle({ width: '2rem', height: '2rem' });
    });

    it('renders with custom size', () => {
        render(<InlineLoader size={3} />);
        const img = screen.getByAltText(LOADER_TEXT.ICON_ALT);
        expect(img).toHaveStyle({ width: '3rem', height: '3rem' });
    });
});
