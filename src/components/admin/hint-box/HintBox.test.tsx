import { render, screen } from '@testing-library/react';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';
import { HintBox } from './HintBox';

jest.mock('../../../assets/icons/info.svg', () => ({
    ReactComponent: (props: any) => <svg {...props} data-testid="info-icon" />,
}));

describe('HintBox', () => {
    it('renders title and icon', () => {
        const title = 'Test title';
        render(<HintBox title={title} />);

        expect(screen.getByText(title)).toBeInTheDocument();
        expect(screen.getByTestId('info-icon')).toBeInTheDocument();
    });

    it('renders title and text when text is provided', () => {
        const title = 'Test title';
        const text = 'Test hint-box text';
        render(<HintBox title={title} text={text} />);

        expect(screen.getByText(title)).toBeInTheDocument();
        expect(screen.getByText(text)).toBeInTheDocument();
    });

    it('does not render additional text when text is not provided', () => {
        const title = 'Test title';
        render(<HintBox title={title} />);

        expect(screen.getByText(title)).toBeInTheDocument();
        const container = screen.getByText(title).closest('.hint-box');
        expect(container?.children).toHaveLength(1);
    });

    it('has correct CSS classes', () => {
        const title = 'Test title';
        render(<HintBox title={title} />);

        const container = screen.getByText(title).closest('.hint-box');
        const titleContainer = screen.getByText(title).parentElement;

        expect(container).toBeInTheDocument();
        expect(titleContainer).toHaveClass('hint-box-title');
    });

    it('icon renders with correct aria-label', () => {
        const title = 'Test title';
        render(<HintBox title={title} />);
        const icon = screen.getByLabelText(COMMON_TEXT_ADMIN.ALT.HINT);
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveAttribute('aria-label', COMMON_TEXT_ADMIN.ALT.HINT);
    });

    it('renders empty text correctly', () => {
        const title = 'Title';
        const text = '';
        render(<HintBox title={title} text={text} />);

        expect(screen.getByText(title)).toBeInTheDocument();

        const container = screen.getByText(title).closest('.hint-box');
        expect(container?.children).toHaveLength(1);
    });
});
