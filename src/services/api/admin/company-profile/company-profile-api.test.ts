import { CompanyProfileApi } from './company-profile-api';
import { mockCompanyProfile, mockCompanyProfileLanguages } from '@/utils/mock-data/admin/company-profile';

describe('CompanyProfileApi', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    it('should return mock profile and languages', async () => {
        const promise = CompanyProfileApi.get({} as any);

        jest.advanceTimersByTime(200);
        const result = await promise;

        expect(result).toEqual({
            profile: mockCompanyProfile,
            languages: mockCompanyProfileLanguages,
        });
    });

    it('should resolve only after artificial delay', async () => {
        let resolved = false;

        const promise = CompanyProfileApi.get({} as any).then(() => {
            resolved = true;
        });

        jest.advanceTimersByTime(199);
        await Promise.resolve();
        expect(resolved).toBe(false);

        jest.advanceTimersByTime(1);
        await promise;
        expect(resolved).toBe(true);
    });
});
