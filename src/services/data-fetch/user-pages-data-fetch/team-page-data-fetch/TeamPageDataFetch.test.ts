import { page1DataFetch } from './TeamPageDataFetch';
import { page1Mock } from '../../../../utils/mock-data/user-pages/team-page/TeamPage';

describe('page1DataFetch', () => {
  it('should return the page1Mock data', async () => {
    const data = await page1DataFetch();
    expect(data).toBe(page1Mock);
  });
});
