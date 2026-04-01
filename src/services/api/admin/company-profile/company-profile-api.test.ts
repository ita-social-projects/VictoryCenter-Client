import { CompanyProfileApi } from './company-profile-api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';

describe('CompanyProfileApi (real http)', () => {
    it('get() requests profile and languages', async () => {
        const client = {
            get: jest.fn(),
        } as any;

        client.get.mockImplementation((url: string) => {
            if (url === API_ROUTES.COMPANY_PROFILE.BASE)
                return Promise.resolve({ data: { contacts: {}, requisites: {}, socialLinks: [] } });
            if (url === API_ROUTES.LOCALIZATION_LANGUAGE.BASE)
                return Promise.resolve({ data: [{ id: 1, code: 'uk', name: 'Ukrainian' }] });
            throw new Error(`Unexpected url ${url}`);
        });

        const res = await CompanyProfileApi.get(client);
        expect(client.get).toHaveBeenCalledWith(API_ROUTES.COMPANY_PROFILE.BASE);
        expect(client.get).toHaveBeenCalledWith(API_ROUTES.LOCALIZATION_LANGUAGE.BASE);
        expect(res.languages?.length).toBe(1);
    });

    it('publish() PUTs patch and returns updated profile', async () => {
        const client = {
            put: jest.fn(),
            get: jest.fn(),
        } as any;

        client.put.mockResolvedValue({ data: { contacts: {}, requisites: {}, socialLinks: [] } });
        client.get.mockResolvedValue({ data: [{ id: 1, code: 'uk', name: 'Ukrainian' }] });

        const res = await CompanyProfileApi.publish(client, {
            contact: {} as any,
            requisite: {} as any,
            socialLinks: [],
        });
        expect(client.put).toHaveBeenCalledWith(API_ROUTES.COMPANY_PROFILE.BASE, expect.any(Object));
        expect(client.get).toHaveBeenCalledWith(API_ROUTES.LOCALIZATION_LANGUAGE.BASE);
        expect(res.profile).toBeTruthy();
    });
});
