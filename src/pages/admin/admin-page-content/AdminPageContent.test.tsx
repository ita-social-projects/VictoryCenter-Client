import { render, waitFor } from '@testing-library/react';
import { AdminPageContent } from './AdminPageContent';
import * as adminHomeDataFetchModule from '../../../utils/mock-data/admin/home';
import { MemoryRouter } from 'react-router';

const spyAdminPageDataFetch = jest.spyOn(adminHomeDataFetchModule, 'adminHomeDataFetch');

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
