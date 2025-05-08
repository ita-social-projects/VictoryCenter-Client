import { act } from 'react';
import { render } from '@testing-library/react';
import { HomePage } from './HomePage';
import * as HomePageDataFetchModule from '../../../services/data-fetch/user-pages-data-fetch/home-page-data-fetch/homePageDataFetch';

const spyHomePageDataFetch = jest.spyOn(HomePageDataFetchModule, 'homePageDataFetch');

describe('Page1', () => {
  const mockHeader = 'Test Header';
  const mockContent = 'Test Content';

  beforeEach(() => {
    spyHomePageDataFetch.mockResolvedValue({
      header: mockHeader,
      content: mockContent,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the component', async () => {
    const { container } = render(<HomePage />);
    
    await act(() => {
        container
    });

    const header = container.querySelector('.header');
    const content = container.querySelector('.content');

    expect(header).toBeInTheDocument();
    expect(header?.textContent).toEqual(mockHeader);

    expect(content).toBeInTheDocument();
    expect(content?.textContent).toEqual(mockContent);

    expect(spyHomePageDataFetch).toHaveBeenCalledTimes(1);
  });
});
