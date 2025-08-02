import { render, waitFor } from '@testing-library/react';
import { AdminPage } from './AdminPage';
import * as adminHomeDataFetchModule from '../../../utils/mock-data/admin/home';
import { MemoryRouter } from 'react-router';

const spyAdminHomeDataFetch = jest.spyOn(adminHomeDataFetchModule, 'adminHomeDataFetch');

describe('AdminHomePage', () => {
    const mockHeader = 'Test Header';
    const mockContent = 'Test Content';

    beforeEach(() => {
        spyAdminHomeDataFetch.mockResolvedValue({
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

        expect(spyAdminHomeDataFetch).toHaveBeenCalledTimes(1);
    });
});
