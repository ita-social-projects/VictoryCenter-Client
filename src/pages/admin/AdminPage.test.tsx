import { render, waitFor } from '@testing-library/react';
import { AdminPage } from './AdminPage';
import * as AdminPageDataFetchModule from '../../utils/mock-data/admin/admin-page';
import { MemoryRouter } from 'react-router';

const spyAdminPageDataFetch = jest.spyOn(AdminPageDataFetchModule, 'adminPageDataFetch');

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
