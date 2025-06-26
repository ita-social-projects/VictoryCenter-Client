import { teamPageDataFetch } from './TeamPageDataFetch';
import { TeamPageMock } from '../../../../utils/mock-data/user-pages/team-page/TeamPage';

describe('teamPageDataFetch', () => {
  it('should return the  data', async () => {
    const data = await teamPageDataFetch();
    expect(data).toBe(TeamPageMock);
  });
});
