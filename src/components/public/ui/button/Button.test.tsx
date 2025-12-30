import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Button } from './Button';
import { isExternalLink } from '@/utils/functions/url';

jest.mock('@/utils/functions/url', () => ({
    isExternalLink: jest.fn(),
}));

const MockIcon = (props: React.SVGProps<SVGSVGElement>) => <svg data-testid="mock-icon" {...props} />;

const renderWithRouter = (ui: React.ReactElement) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
};

describe('Button Component', () => {
    const defaultProps = {
        children: 'Click me',
        onClick: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (isExternalLink as jest.Mock).mockReturnValue(false);
    });

    describe('Rendering Variants (HTML Button)', () => {
        it('renders a button with default props', () => {
            render(<Button {...defaultProps} />);
            const button = screen.getByRole('button', { name: /click me/i });

            expect(button).toBeInTheDocument();
            expect(button).toHaveClass('button', 'primary-dark', 'medium');
            expect(button).not.toBeDisabled();
        });

        it('applies correct variant and size classes', () => {
            render(<Button {...defaultProps} variant="secondary-light" size="large" />);
            const button = screen.getByRole('button');

            expect(button).toHaveClass('secondary-light', 'large');
        });

        it('applies custom className', () => {
            render(<Button {...defaultProps} className="custom-test-class" />);
            expect(screen.getByRole('button')).toHaveClass('custom-test-class');
        });

        it('passes native attributes to button', () => {
            render(<Button {...defaultProps} type="submit" name="test-btn" />);
            const button = screen.getByRole('button');

            expect(button).toHaveAttribute('type', 'submit');
            expect(button).toHaveAttribute('name', 'test-btn');
        });
    });

    describe('Interaction & Disabled State', () => {
        it('handles onClick events', () => {
            render(<Button {...defaultProps} />);
            fireEvent.click(screen.getByRole('button'));
            expect(defaultProps.onClick).toHaveBeenCalledTimes(1);
        });

        it('prevents interactions when disabled', () => {
            render(<Button {...defaultProps} disabled />);
            const button = screen.getByRole('button');

            fireEvent.click(button);

            expect(defaultProps.onClick).not.toHaveBeenCalled();
            expect(button).toBeDisabled();
            expect(button).toHaveClass('disabled');
            expect(button).toHaveAttribute('aria-disabled', 'true');
            expect(button).toHaveAttribute('tabIndex', '-1');
        });
    });

    describe('Navigation Logic', () => {
        it('renders internal <Link> when href is provided and isExternalLink is false', () => {
            (isExternalLink as jest.Mock).mockReturnValue(false);

            renderWithRouter(<Button href="/dashboard">Go Home</Button>);
            const link = screen.getByRole('link', { name: /go home/i });

            expect(link).toHaveAttribute('href', '/dashboard');
            expect(link).not.toHaveAttribute('target', '_blank');
        });

        it('renders external <a> when href is provided and isExternalLink is true', () => {
            (isExternalLink as jest.Mock).mockReturnValue(true);

            render(<Button href="https://google.com">Google</Button>);
            const link = screen.getByRole('link', { name: /google/i });

            expect(link).toHaveAttribute('href', 'https://google.com');
            expect(link).toHaveAttribute('target', '_blank');
            expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        });

        it('renders disabled link correctly (a11y check)', () => {
            (isExternalLink as jest.Mock).mockReturnValue(false);

            renderWithRouter(
                <Button href="/dashboard" disabled>
                    Disabled Link
                </Button>,
            );
            const link = screen.getByRole('link');

            expect(link).toHaveAttribute('aria-disabled', 'true');
            expect(link).toHaveAttribute('tabIndex', '-1');
            expect(link).toHaveClass('disabled');

            fireEvent.click(link);
        });
    });

    describe('Icon & Layout Logic', () => {
        it('renders icon on the left by default', () => {
            render(<Button {...defaultProps} icon={MockIcon} />);

            const contentSpan = screen.getByText(/click me/i).closest('.content');
            expect(contentSpan).toHaveAttribute('data-icon-position', 'left');

            const icons = screen.getAllByTestId('mock-icon');
            expect(icons).toHaveLength(1);
        });

        it('renders icon on the right when configured', () => {
            render(<Button {...defaultProps} icon={MockIcon} iconPosition="right" />);

            const contentSpan = screen.getByText(/click me/i).closest('.content');
            expect(contentSpan).toHaveAttribute('data-icon-position', 'right');
        });

        it('renders icon-only button with aria-label', () => {
            render(<Button icon={MockIcon} ariaLabel="Edit Item" onClick={jest.fn()} />);

            const icon = screen.getByTestId('mock-icon');

            expect(screen.queryByText(/click me/i)).not.toBeInTheDocument();
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveAttribute('aria-label', 'Edit Item');
        });
    });
});
