import { render, screen } from '@testing-library/react';
import { LoadableContent } from './LoadableContent';

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
        render(
            <LoadableContent isLoading={true} error={false}>
                Test Content
            </LoadableContent>,
        );
        expect(screen.getByTestId('loader')).toBeInTheDocument();
        expect(screen.queryByTestId('error-message')).toBeNull();
        expect(screen.queryByText('Test Content')).toBeNull();
    });

    it('should render a default error', () => {
        render(
            <LoadableContent isLoading={false} error={true}>
                Test Content
            </LoadableContent>,
        );
        expect(screen.queryByTestId('loader')).toBeNull();
        const error = screen.getByTestId('error-message');
        expect(error).toBeInTheDocument();
        expect(error).toHaveTextContent('Помилка завантаження даних');
        expect(screen.queryByText('Test Content')).toBeNull();
    });

    it('should render a custom error message', () => {
        render(
            <LoadableContent isLoading={false} error={true} errorMessage="Custom Error">
                Test Content
            </LoadableContent>,
        );
        const error = screen.getByTestId('error-message');
        expect(error).toBeInTheDocument();
        expect(error).toHaveTextContent('Custom Error');
    });

    it('should render children when is not loading and has no errors', () => {
        render(
            <LoadableContent isLoading={false} error={false}>
                Test Content
            </LoadableContent>,
        );
        expect(screen.queryByTestId('loader')).toBeNull();
        expect(screen.queryByTestId('error-message')).toBeNull();
        expect(screen.getByText('Test Content')).toBeInTheDocument();
    });
});
