import React from 'react';
import { render, screen } from '@testing-library/react';
import { InputError } from './InputError';

describe('InputError', () => {
    it('renders the error text when provided', () => {
        render(<InputError error="Error!" />);
        expect(screen.getByText('Error!')).toBeInTheDocument();
    });

    it('renders nothing when error is not provided', () => {
        const { container } = render(<InputError />);
        expect(container.firstChild).toBeNull();
    });

    it('applies the "error" class to the element', () => {
        render(<InputError error="Error!" />);
        expect(screen.getByText('Error!')).toHaveClass('input-error');
    });
});
