import { HippotherapyApi } from './hippotherapy-api';
import { hippotherapyMock } from '@/utils/mock-data/public/hippotherapy';

describe('HippotherapyApi', () => {
    it('fetches hippothippotherapyMockherapy data successfully', async () => {
        const data = await HippotherapyApi.get();
        expect(data).toEqual(hippotherapyMock);
    });
});
