import React from 'react';
import { render, screen } from '@testing-library/react';
import { InputLabel } from './InputLabel';

describe('InputLabel', () => {
    it('renders label text', () => {
        render(<InputLabel htmlFor="email" text="Email" />);
        expect(screen.getByText('Email')).toBeInTheDocument();
    });

    it('renders required asterisk when isRequired is true', () => {
        render(<InputLabel htmlFor="email" text="Email" isRequired />);
        expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('does not render asterisk when isRequired is false', () => {
        render(<InputLabel htmlFor="email" text="Email" />);
        expect(screen.queryByText('*')).not.toBeInTheDocument();
    });

    it('sets correct htmlFor attribute', () => {
        render(<InputLabel htmlFor="username" text="Username" />);
        const label = screen.getByText('Username').closest('label');
        expect(label).toHaveAttribute('for', 'username');
    });
});
