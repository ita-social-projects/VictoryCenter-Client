import { page2DataFetch } from './page2DataFetch';
import { page2Mock } from '../../../../utils/mock-data/user-pages/page-2/page2';

describe('page2DataFetch', () => {
  it('should return the page2Mock data', async () => {
    const data = await page2DataFetch();
    expect(data).toBe(page2Mock);
  });
});
