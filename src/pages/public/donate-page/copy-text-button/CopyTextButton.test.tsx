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

    it('copies text and shows alert on click', async () => {
        render(<CopyTextButton textToCopy="test123" />);
        fireEvent.click(screen.getByRole('button'));
        await waitFor(() => {
            expect(navigator.clipboard.writeText).toHaveBeenCalledWith('test123');
            expect(window.alert).toHaveBeenCalledWith('Copied!');
        });
    });
});
