import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CopyTextButton } from './CopyTextButton';

describe('CopyTextButton', () => {
    beforeAll(() => {
        Object.assign(navigator, {
            clipboard: {
                writeText: jest.fn(),
            },
        });
    });

    beforeEach(() => {
        window.alert = jest.fn();
    });

    it('renders the copy icon', () => {
        render(<CopyTextButton textToCopy="test123" />);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('resets copied state after animation ends', async () => {
        render(<CopyTextButton textToCopy="test123" />);
        const button = screen.getByRole('button');

        fireEvent.click(button);

        await waitFor(() => {
            expect(button).toHaveClass('copied');
        });
        fireEvent.animationEnd(button);

        expect(button).not.toHaveClass('copied');
    });
});
