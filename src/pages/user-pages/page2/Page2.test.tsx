import { render, waitFor } from '@testing-library/react';
import { Page2 } from './Page2';
import * as Page2DataFetchModule from '../../../services/data-fetch/user-pages-data-fetch/page-2-data-fetch/page2DataFetch';

const spyPage2DataFetch = jest.spyOn(Page2DataFetchModule, 'page2DataFetch');

describe('Page2', () => {
  const mockHeader = 'Test Header';
  const mockContent = 'Test Content';

  beforeEach(() => {
    spyPage2DataFetch.mockResolvedValue({
      header: mockHeader,
      content: mockContent,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component', async () => {
    const { container } = render(<Page2 />);

    const header = container.querySelector('.header');
    const content = container.querySelector('.content');

    expect(header).toBeInTheDocument();
    expect(content).toBeInTheDocument();

    await waitFor(() => {
      expect(header?.textContent).toEqual(mockHeader);
      expect(content?.textContent).toEqual(mockContent);
    });
    
    expect(spyPage2DataFetch).toHaveBeenCalledTimes(1);
  });
});
