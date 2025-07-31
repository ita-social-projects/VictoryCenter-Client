import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Button } from './Button';

jest.mock('./button.scss', () => ({}));

describe('Button Component', () => {
    it('renders children correctly', () => {
        render(<Button buttonStyle={'primary'}>Click me</Button>);
        expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('applies primary class when buttonStyle is primary', () => {
        render(<Button buttonStyle="primary">Primary Button</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('btn-primary');
    });

    it('applies none class when buttonStyle is not chosen', () => {
        render(<Button>Primary Button</Button>);
        const button = screen.getByRole('button');
        expect(button).not.toHaveClass();
    });

    it('applies secondary class when buttonStyle is secondary', () => {
        render(<Button buttonStyle="secondary">Secondary Button</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('btn-secondary');
    });

    it('has default type of button', () => {
        render(<Button buttonStyle="primary">Default Type</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('type', 'button');
    });

    it('applies custom type when provided', () => {
        render(
            <Button buttonStyle="primary" type="submit">
                Submit Button
            </Button>,
        );
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('type', 'submit');
    });

    it('applies reset type when provided', () => {
        render(
            <Button buttonStyle="primary" type="reset">
                Reset Button
            </Button>,
        );
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('type', 'reset');
    });

    it('applies form attribute when provided', () => {
        render(
            <Button buttonStyle="primary" formId="test-form">
                Form Button
            </Button>,
        );
        const button = screen.getByRole('button');
        expect(button).toHaveAttribute('form', 'test-form');
    });

    it('does not apply form attribute when undefined', () => {
        render(
            <Button buttonStyle="primary" formId={undefined}>
                No Form Button
            </Button>,
        );
        const button = screen.getByRole('button');
        expect(button).not.toHaveAttribute('form');
    });

    it('calls onClick handler when clicked', () => {
        const mockOnClick = jest.fn();
        render(
            <Button buttonStyle="primary" onClick={mockOnClick}>
                Clickable Button
            </Button>,
        );

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('does not throw error when clicked without onClick handler', () => {
        render(<Button buttonStyle="primary">No Handler Button</Button>);
        const button = screen.getByRole('button');

        expect(() => fireEvent.click(button)).not.toThrow();
    });

    it('calls onClick handler multiple times when clicked multiple times', () => {
        const mockOnClick = jest.fn();
        render(
            <Button buttonStyle="primary" onClick={mockOnClick}>
                Multi Click Button
            </Button>,
        );

        const button = screen.getByRole('button');
        fireEvent.click(button);
        fireEvent.click(button);
        fireEvent.click(button);

        expect(mockOnClick).toHaveBeenCalledTimes(3);
    });

    it('renders complex children correctly', () => {
        render(
            <Button buttonStyle="primary">
                <span>Icon</span>
                <span>Text</span>
            </Button>,
        );

        expect(screen.getByText('Icon')).toBeInTheDocument();
        expect(screen.getByText('Text')).toBeInTheDocument();
    });

    it('applies all props correctly when provided together', () => {
        const mockOnClick = jest.fn();
        render(
            <Button buttonStyle="secondary" type="submit" formId="test-form" onClick={mockOnClick}>
                Complete Button
            </Button>,
        );

        const button = screen.getByRole('button');
        expect(button).toHaveClass('btn-secondary');
        expect(button).toHaveAttribute('type', 'submit');
        expect(button).toHaveAttribute('form', 'test-form');
        expect(screen.getByText('Complete Button')).toBeInTheDocument();

        fireEvent.click(button);
        expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('handles the component with all valid buttonStyle values', () => {
        const { rerender } = render(<Button buttonStyle="primary">Test</Button>);
        expect(screen.getByRole('button')).toHaveClass('btn-primary');

        rerender(<Button buttonStyle="secondary">Test</Button>);
        expect(screen.getByRole('button')).toHaveClass('btn-secondary');
    });

    it('is accessible as a button element', () => {
        render(<Button buttonStyle="primary">Accessible Button</Button>);
        const button = screen.getByRole('button');
        expect(button.tagName).toBe('BUTTON');
    });

    it('sets disabled attribute when disabled prop is true', () => {
        render(
            <Button buttonStyle="primary" disabled={true}>
                Disabled Button
            </Button>,
        );
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
    });

    it('does not call onClick handler when button is disabled', () => {
        const mockOnClick = jest.fn();
        render(
            <Button buttonStyle="primary" disabled={true} onClick={mockOnClick}>
                Disabled Button
            </Button>,
        );

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('applies disabled class when disabled and buttonStyle is provided', () => {
        render(
            <Button buttonStyle="primary" disabled={true}>
                Disabled Primary Button
            </Button>,
        );
        const button = screen.getByRole('button');
        expect(button).toHaveClass('btn-primary');
        expect(button).toBeDisabled();
    });

    it('applies disabled class for secondary button when disabled', () => {
        render(
            <Button buttonStyle="secondary" disabled={true}>
                Disabled Secondary Button
            </Button>,
        );
        const button = screen.getByRole('button');
        expect(button).toHaveClass('btn-secondary');
        expect(button).toBeDisabled();
    });
});
