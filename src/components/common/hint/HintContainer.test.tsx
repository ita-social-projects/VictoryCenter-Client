import { render, screen } from '@testing-library/react';
import HintContainer from './HintContainer';

// Mock the icon
jest.mock('../../../assets/icons/info.svg', () => 'mocked-info-icon.svg');

describe('HintContainer', () => {
  it('renders title and icon', () => {
    const title = 'Test title';

    render(<HintContainer title={title} />);

    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByAltText('hint-icon')).toBeInTheDocument();
  });

  it('renders title and text when text is provided', () => {
    const title = 'Test title';
    const text = 'Test hint text';

    render(<HintContainer title={title} text={text} />);

    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it('does not render additional text when text is not provided', () => {
    const title = 'Test title';

    render(<HintContainer title={title} />);

    expect(screen.getByText(title)).toBeInTheDocument();

    // Check that additional div with text is not created
    const container = screen.getByText(title).closest('.hint-container');
    expect(container?.children).toHaveLength(1); // Only title div
  });

  it('has correct CSS classes', () => {
    const title = 'Test title';
    const text = 'Test text';

    render(<HintContainer title={title} text={text} />);

    expect(screen.getByText(title).closest('.hint-container')).toBeInTheDocument();
    expect(screen.getByText(title).closest('.hint-container-title')).toBeInTheDocument();
  });

  it('icon has correct src and alt attributes', () => {
    const title = 'Test title';

    render(<HintContainer title={title} />);

    const icon = screen.getByAltText('hint-icon') as HTMLImageElement;
    expect(icon.src).toContain('mocked-info-icon.svg');
    expect(icon.alt).toBe('hint-icon');
  });

  it('renders empty text correctly', () => {
    const title = 'Title';
    const text = '';

    render(<HintContainer title={title} text={text} />);

    expect(screen.getByText(title)).toBeInTheDocument();
    // Empty text should not render due to conditional rendering
    const container = screen.getByText(title).closest('.hint-container');
    expect(container?.children).toHaveLength(1);
  });
});
