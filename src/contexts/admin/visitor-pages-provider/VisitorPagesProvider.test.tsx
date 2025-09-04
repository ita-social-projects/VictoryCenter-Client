import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { VisitorPagesProvider, useVisitorPages } from './VisitorPagesProvider';
import { FaqApi } from '../../../services/api/admin/faq/faq-api';

jest.mock('../../../services/api/admin/faq/faq-api', () => ({
    FaqApi: {
        getPages: jest.fn(),
    },
}));

jest.mock('../../../hooks/admin/use-admin-client/useAdminClient', () => ({
    useAdminClient: jest.fn(() => ({})),
}));

const mockPages = [
    { id: 1, title: 'Page A', slug: 'page-a' },
    { id: 2, title: 'Page B', slug: 'page-b' },
];

function TestComponent() {
    const { pages, isLoading, error, refetchPages } = useVisitorPages();
    return (
        <div>
            <div data-testid="loading">{isLoading ? 'loading' : 'not-loading'}</div>
            <div data-testid="error">{error ? 'error' : 'no-error'}</div>
            <div data-testid="pages">{pages.map((p) => p.title).join(',')}</div>
            <button data-testid="refetch" onClick={refetchPages}>
                Refetch
            </button>
        </div>
    );
}

describe('VisitorPagesProvider', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('loads and provides pages', async () => {
        (FaqApi.getPages as jest.Mock).mockResolvedValue(mockPages);
        const { getByTestId } = render(
            <VisitorPagesProvider>
                <TestComponent />
            </VisitorPagesProvider>,
        );
        await waitFor(() => {
            expect(getByTestId('pages').textContent).toBe('Page A,Page B');
            expect(getByTestId('loading').textContent).toBe('not-loading');
            expect(getByTestId('error').textContent).toBe('no-error');
        });
    });

    it('handles error from API', async () => {
        (FaqApi.getPages as jest.Mock).mockRejectedValue(new Error('fail'));
        const { getByTestId } = render(
            <VisitorPagesProvider>
                <TestComponent />
            </VisitorPagesProvider>,
        );
        await waitFor(() => {
            expect(getByTestId('error').textContent).toBe('error');
            expect(getByTestId('loading').textContent).toBe('not-loading');
        });
    });

    it('refetchPages updates pages', async () => {
        (FaqApi.getPages as jest.Mock).mockResolvedValueOnce([]).mockResolvedValueOnce(mockPages);
        const { getByTestId } = render(
            <VisitorPagesProvider>
                <TestComponent />
            </VisitorPagesProvider>,
        );
        await waitFor(() => {
            expect(getByTestId('pages').textContent).toBe('');
        });
        (FaqApi.getPages as jest.Mock).mockResolvedValue(mockPages);
        getByTestId('refetch').click();
        await waitFor(() => {
            expect(getByTestId('pages').textContent).toBe('Page A,Page B');
        });
    });

    it('throws if used outside provider', () => {
        // Suppress error boundary logs
        const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
        expect(() => render(<TestComponent />)).toThrow();
        spy.mockRestore();
    });
});
