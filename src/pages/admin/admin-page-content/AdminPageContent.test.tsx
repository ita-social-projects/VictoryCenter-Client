import { render,  waitFor } from '@testing-library/react';
import { AdminPageContent } from './AdminPageContent';
import * as AdminPageDataFetchModule from '../../../services/data-fetch/admin-page-data-fetch/adminPageDataFetch';
import * as AdminContextProviderModule from '../../../context/admin-context-provider/AdminContextProvider';

const spyAdminPageDataFetch = jest.spyOn(AdminPageDataFetchModule, 'adminPageDataFetch');
const spyUseAdminContext = jest.spyOn(AdminContextProviderModule, 'useAdminContext');

describe('AdminPageContent', () => {
  const mockHeader = 'Test Header';
  const mockContent = 'Test Content';

  beforeEach(() => {
    spyAdminPageDataFetch.mockResolvedValue({
      header: mockHeader,
      content: mockContent,
    });

    spyUseAdminContext.mockReturnValue({
      token: 'fake-token'
    })
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component', async () => {
    const { container } = render(<AdminPageContent />);

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
