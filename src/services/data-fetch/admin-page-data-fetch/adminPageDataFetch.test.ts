import { adminPageDataFetch } from './adminPageDataFetch';
import { adminPageMock } from '../../../utils/mock-data/admin-page/adminPage';

describe('adminPageDataFetch', () => {
    it('should return the adminPageMock data', async () => {
        const data = await adminPageDataFetch();
        expect(data).toBe(adminPageMock);
    });
});
