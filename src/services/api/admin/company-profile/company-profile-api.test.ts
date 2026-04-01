import { CompanyProfileApi } from './company-profile-api';
import { mockCompanyProfile, mockCompanyProfileLanguages } from '@/utils/mock-data/admin/company-profile';
import type { CompanyProfilePatch } from '@/utils/functions/mappers/admin/company-profile/company-profile-mappers';

const createMockPatch = (socialLinks: any[] = []): CompanyProfilePatch => ({
    contact: {
        phone: '+380000000000',
        address: 'New UA address',
        email: 'new@email.com',
        correspondenceEmail: 'new-office@email.com',
        motto: 'New motto',
        localizations: [
            { languageCode: 'uk', address: 'New UA address', motto: 'New motto' },
            { languageCode: 'en', address: 'New EN address', motto: 'New EN motto' },
        ],
    },
    requisite: {
        recipient: 'New recipient UA',
        edrpou: '87654321',
        address: 'New UA req address',
        localizations: [
            { languageCode: 'uk', recipient: 'New recipient UA', address: 'New UA req address' },
            { languageCode: 'en', recipient: 'New recipient EN', address: 'New EN req address' },
        ],
    },
    socialLinks,
});

describe('CompanyProfileApi', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        CompanyProfileApi.__resetMocks();
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

    it('publish should update stored profile and be returned by subsequent get()', async () => {
        const patch = createMockPatch([{ socialPlatform: 'Instagram', url: 'https://instagram.com/new' }]);
        const publishPromise = CompanyProfileApi.publish({} as any, patch);

        jest.advanceTimersByTime(200);
        const published = await publishPromise;

        expect(published.profile.contact.phone).toBe('+380000000000');
        expect(published.profile.contact.email).toBe('new@email.com');
        expect(published.profile.requisite.edrpou).toBe('87654321');
        expect(published.profile.socialLinks[0]?.url).toBe('https://instagram.com/new');

        const getPromise = CompanyProfileApi.get({} as any);

        jest.advanceTimersByTime(200);
        const afterGet = await getPromise;

        expect(afterGet.profile.contact.phone).toBe('+380000000000');
        expect(afterGet.profile.requisite.edrpou).toBe('87654321');
        expect(afterGet.profile.socialLinks[0]?.url).toBe('https://instagram.com/new');
    });

    it('__resetMocks should restore initial mock profile', async () => {
        const patch = createMockPatch([]);
        const publishPromise = CompanyProfileApi.publish({} as any, patch);

        jest.advanceTimersByTime(200);
        await publishPromise;

        CompanyProfileApi.__resetMocks();

        const getPromise = CompanyProfileApi.get({} as any);

        jest.advanceTimersByTime(200);
        const result = await getPromise;

        expect(result.profile).toEqual(mockCompanyProfile);
        expect(result.languages).toEqual(mockCompanyProfileLanguages);
    });
});
