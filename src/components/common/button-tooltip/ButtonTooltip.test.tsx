import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ButtonTooltip } from './ButtonTooltip';

// Mock the SVG imports
jest.mock('../../../assets/icons/info.svg', () => 'info-icon.svg');
jest.mock('../../../assets/icons/info-active.svg', () => 'info-active-icon.svg');

describe('ButtonTooltip', () => {
  const defaultProps = {
    children: <div>Tooltip content</div>,
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component with default props', () => {
    render(<ButtonTooltip {...defaultProps} />);

    expect(screen.getByRole('img', { name: /info/i })).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', 'info-icon.svg');
    expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
  });

  it('applies custom className to wrapper', () => {
    const { container } = render(
      <ButtonTooltip {...defaultProps} className="custom-class" />
    );

    const wrapper = container.querySelector('.button-tooltip-wrapper');
    expect(wrapper).toHaveClass('custom-class');
  });

  it('shows tooltip when clicked and changes icon', () => {
    render(<ButtonTooltip {...defaultProps} />);

    const icon = screen.getByRole('img', { name: /info/i });
    fireEvent.click(icon);

    expect(screen.getByText('Tooltip content')).toBeInTheDocument();
    expect(icon).toHaveAttribute('src', 'info-active-icon.svg');
  });

  it('hides tooltip when clicked again', () => {
    render(<ButtonTooltip {...defaultProps} />);

    const wrapper = screen.getByRole('img').closest('.button-tooltip-wrapper');
    expect(wrapper).not.toBeNull();

    // Show tooltip
    fireEvent.click(wrapper!);
    expect(screen.getByText('Tooltip content')).toBeInTheDocument();

    // Hide tooltip
    fireEvent.click(wrapper!);
    expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
  });

  it('applies correct position class for bottom position (default)', () => {
    render(<ButtonTooltip {...defaultProps} />);

    fireEvent.click(screen.getByRole('img'));

    const tooltip = screen.getByText('Tooltip content').closest('.button-tooltip-popup');
    expect(tooltip).toHaveClass('button-tooltip-popup--bottom');
  });

  it('applies correct position class for top position', () => {
    render(<ButtonTooltip {...defaultProps} position="top" />);

    fireEvent.click(screen.getByRole('img'));

    const tooltip = screen.getByText('Tooltip content').closest('.button-tooltip-popup');
    expect(tooltip).toHaveClass('button-tooltip-popup--top');
  });

  it('hides tooltip when clicking outside', async () => {
    render(
      <div>
        <ButtonTooltip {...defaultProps} />
        <div data-testid="outside-element">Outside</div>
      </div>
    );

    // Show tooltip
    fireEvent.click(screen.getByRole('img'));
    expect(screen.getByText('Tooltip content')).toBeInTheDocument();

    // Click outside
    fireEvent.mouseDown(screen.getByTestId('outside-element'));

    await waitFor(() => {
      expect(screen.queryByText('Tooltip content')).not.toBeInTheDocument();
    });
  });

  it('prevents event propagation when clicking on tooltip content', () => {
    const mockHandler = jest.fn();

    render(
      <div onClick={mockHandler}>
        <ButtonTooltip {...defaultProps} />
      </div>
    );

    fireEvent.click(screen.getByRole('img'));
    fireEvent.click(screen.getByText('Tooltip content'));

    // The parent handler should not be called due to stopPropagation
    expect(mockHandler).not.toHaveBeenCalled();
  });
});