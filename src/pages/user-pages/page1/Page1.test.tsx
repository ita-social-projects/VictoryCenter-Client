import { render, waitFor } from '@testing-library/react';
import { Page1 } from './Page1';
import * as Page1DataFetchModule from '../../../services/data-fetch/user-pages-data-fetch/page-1-data-fetch/page1DataFetch';

const spyPage1DataFetch = jest.spyOn(Page1DataFetchModule, 'page1DataFetch');

describe('Page1', () => {
  const mockHeader = 'Test Header';
  const mockContent = 'Test Content';

  beforeEach(() => {
    spyPage1DataFetch.mockResolvedValue({
      header: mockHeader,
      content: mockContent,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component', async () => {
    const { container } = render(<Page1 />);

    const header = container.querySelector('.header');
    const content = container.querySelector('.content');

    expect(header).toBeInTheDocument();
    expect(content).toBeInTheDocument();

    await waitFor(() => {
      expect(header?.textContent).toEqual(mockHeader);
      expect(content?.textContent).toEqual(mockContent);
    });

    expect(spyPage1DataFetch).toHaveBeenCalledTimes(1);
  });
});
