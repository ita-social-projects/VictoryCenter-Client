import { render } from '@testing-library/react';
import { AdminHomePage } from './AdminHomePage';
import { MemoryRouter } from 'react-router';

jest.mock('../../../assets/icons/arrow-left.svg', () => ({
    ReactComponent: (props: any) => <svg {...props} data-testid="admin-page-action-hint-icon" />,
}));

describe('AdminHomePage', () => {
    it('renders the component', async () => {
        const { container } = render(
            <MemoryRouter>
                <AdminHomePage />
            </MemoryRouter>,
        );

        const pageContent = container.querySelector('.admin-page-content');
        const pageMainText = container.querySelector('.admin-page-main-text');
        const pageSubText = container.querySelector('.admin-page-sub-text');
        const pageActionHint = container.querySelector('.admin-page-action-hint');
        expect(pageContent).toBeInTheDocument();
        expect(pageMainText).toBeInTheDocument();
        expect(pageSubText).toBeInTheDocument();
        expect(pageActionHint).toBeInTheDocument();
    });
});
