import { render, waitFor } from '@testing-library/react';
import { AdminPage } from './AdminPage';
import * as AdminPageDataFetchModule from '../../services/data-fetch/admin-page-data-fetch/adminPageDataFetch';
import * as AdminContextProviderModule from '../../context/admin-context-provider/AdminContextProvider';
import { MemoryRouter } from 'react-router';

const spyAdminPageDataFetch = jest.spyOn(AdminPageDataFetchModule, 'adminPageDataFetch');
const spyUseAdminContext = jest.spyOn(AdminContextProviderModule, 'useAdminContext');

// DEV NOTE: This test would be very similar to AdminPageContent
// since this component will render AdminPageContent.tsx
// in a future we may consider to combine those two test files with tests into one
// so we would not repeat ourselfs

describe('AdminPageContent', () => {
    const mockHeader = 'Test Header';
    const mockContent = 'Test Content';

    beforeEach(() => {
        spyAdminPageDataFetch.mockResolvedValue({
            header: mockHeader,
            content: mockContent,
        });

        spyUseAdminContext.mockReturnValue({
            token: 'fake-token',
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders the component', async () => {
        const { container } = render(
            <MemoryRouter>
                {' '}
                <AdminPage />
            </MemoryRouter>,
        );

        const header = container.querySelector('.header');
        const content = container.querySelector('.content');

        expect(header).toBeInTheDocument();
        expect(content).toBeInTheDocument();

        await waitFor(() => {
            expect(header?.textContent).toEqual(mockHeader);
            expect(content?.textContent).toEqual(mockContent);
        });

        expect(spyAdminPageDataFetch).toHaveBeenCalledTimes(1);
    });
});
