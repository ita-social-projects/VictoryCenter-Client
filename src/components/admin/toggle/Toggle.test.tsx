import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';

import { Toggle } from './Toggle';

describe('Toggle', () => {
    it('renders checked state correctly', () => {
        const { rerender } = render(<Toggle checked={true} onChange={jest.fn()} />);
        expect(screen.getByRole('switch')).toBeChecked();

        rerender(<Toggle checked={false} onChange={jest.fn()} />);
        expect(screen.getByRole('switch')).not.toBeChecked();
    });

    it('calls onChange with new value when clicked', () => {
        const onChangeSpy = jest.fn();
        render(<Toggle checked={false} onChange={onChangeSpy} />);

        fireEvent.click(screen.getByRole('switch'));
        expect(onChangeSpy).toHaveBeenCalledWith(true);
    });

    it('is disabled when disabled prop is true', () => {
        const onChangeSpy = jest.fn();
        render(<Toggle checked={false} onChange={onChangeSpy} disabled={true} />);

        const toggle = screen.getByRole('switch');
        expect(toggle).toBeDisabled();

        fireEvent.click(toggle);
        expect(onChangeSpy).not.toHaveBeenCalled();
    });
});
