import { render, screen } from '@testing-library/react';
import { LoadableContent } from "./LoadableContent";

jest.mock('react-i18next', () => {
    const globalUk = require('@/locales/uk/global.json');

    return {
        useTranslation: () => ({
            t: (key: string) => globalUk[key] ?? key,
        }),
    };
});


describe('LoadableContent', () => {
  it('should render loading state', () => {
    render(<LoadableContent isLoading={true} error={false}>Test Content</LoadableContent>);
    expect(screen.queryByTestId('loader')).toBeInTheDocument();
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    expect(screen.getByText('Test Content')).not.toBeInTheDocument();
  });

  it('should render a defauult error', () => {
    render(<LoadableContent isLoading={false} error={true}>Test Content</LoadableContent>);
    expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    const error = screen.getByTestId('error-message');
    expect(error).toBeInTheDocument();
    expect(error).toHaveTextContent('LOADING_ERROR');
    expect(screen.getByText('Test Content')).not.toBeInTheDocument();
  });

  it('should render a custom error message', () => {
    render(<LoadableContent isLoading={false} error={true} errorMessage="Custom Error">Test Content</LoadableContent>);
    const error = screen.getByTestId('error-message');
    expect(error).toBeInTheDocument();
    expect(error).toHaveTextContent('Custom Error');
  });

  it('should render chindren when is not loading or has an error', () => {
    render(<LoadableContent isLoading={false} error={false}>Test Content</LoadableContent>);
    expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
});
