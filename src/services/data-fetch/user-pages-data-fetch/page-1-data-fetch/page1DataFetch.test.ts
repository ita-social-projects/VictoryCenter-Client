import { page1DataFetch } from './page1DataFetch';
import { page1Mock } from '../../../../utils/mock-data/user-pages/page-1/page1';

describe('page1DataFetch', () => {
  it('should return the page1Mock data', async () => {
    const data = await page1DataFetch();
    expect(data).toBe(page1Mock);
  });
});
