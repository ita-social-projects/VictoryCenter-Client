import { render, waitFor } from '@testing-library/react';
import { AdminPageContent } from './AdminPageContent';
import * as AdminPageDataFetchModule from '../../../services/data-fetch/admin-page-data-fetch/adminPageDataFetch';
import { MemoryRouter } from 'react-router';

const spyAdminPageDataFetch = jest.spyOn(AdminPageDataFetchModule, 'adminPageDataFetch');

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
                <AdminPageContent />
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
