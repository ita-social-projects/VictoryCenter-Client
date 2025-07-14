import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as AdminContextModule from '../../../context/admin-context-provider/AdminContextProvider';
import { useAdminClient } from './useAdminClient';
import { AxiosInstance } from 'axios';

jest.spyOn(AdminContextModule, 'useAdminContext');

describe('useAdminClient', () => {
    it('returns the client instance from context', () => {
        const clientMock = {
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
        } as unknown as AxiosInstance;

        (AdminContextModule.useAdminContext as jest.Mock).mockReturnValue({
            client: clientMock,
            isAuthenticated: false,
            isLoading: false,
            login: jest.fn(),
            logout: jest.fn(),
            refreshAccessToken: jest.fn(),
        });

        function TestComponent() {
            const client = useAdminClient();
            return client === clientMock ? <div data-testid="result"></div> : null;
        }

        render(<TestComponent />);
        expect(screen.getByTestId('result')).toBeInTheDocument();
        expect(AdminContextModule.useAdminContext).toHaveBeenCalledTimes(1);
    });
});
