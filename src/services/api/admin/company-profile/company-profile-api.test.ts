import { CompanyProfileApi } from './company-profile-api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';

const validPatch = {
    contacts: {
        phone: '',
        address: '',
        email: '',
        correspondenceEmail: '',
        motto: undefined,
        localizations: [],
    },
    requisites: {
        recipient: '',
        edrpou: '',
        address: '',
        localizations: [],
    },
    socialLinks: [],
};

describe('CompanyProfileApi (real http)', () => {
    it('get() requests profile and languages and normalizes missing localizations', async () => {
        const client = {
            get: jest.fn(),
        } as any;

        client.get.mockImplementation((url: string) => {
            if (url === API_ROUTES.COMPANY_PROFILE.BASE) {
                return Promise.resolve({
                    data: {
                        contacts: { phone: '+380' },
                        requisites: { recipient: 'VC' },
                        socialLinks: [],
                    },
                });
            }
            if (url === API_ROUTES.LOCALIZATION_LANGUAGE.BASE) {
                return Promise.resolve({ data: [{ id: 1, code: 'uk', name: 'Ukrainian' }] });
            }
            throw new Error(`Unexpected url ${url}`);
        });

        const res = await CompanyProfileApi.get(client);

        expect(client.get).toHaveBeenCalledWith(API_ROUTES.COMPANY_PROFILE.BASE);
        expect(client.get).toHaveBeenCalledWith(API_ROUTES.LOCALIZATION_LANGUAGE.BASE);

        expect(res.profile.contact).toMatchObject({
            phone: '+380',
            localizations: [],
        });

        expect(res.profile.requisite).toMatchObject({
            recipient: 'VC',
            localizations: [],
        });

        expect(res.languages).toEqual([{ id: 1, code: 'uk', name: 'Ukrainian' }]);
    });

    it('get() normalizes missing dto parts to defaults', async () => {
        const client = { get: jest.fn() } as any;

        client.get.mockImplementation((url: string) => {
            if (url === API_ROUTES.COMPANY_PROFILE.BASE) return Promise.resolve({ data: {} });
            if (url === API_ROUTES.LOCALIZATION_LANGUAGE.BASE) return Promise.resolve({ data: [] });
            throw new Error(`Unexpected url ${url}`);
        });

        const res = await CompanyProfileApi.get(client);

        expect(res.profile.id).toBeUndefined();

        expect(res.profile.contact).toMatchObject({
            phone: '',
            email: '',
            address: '',
            correspondenceEmail: '',
            localizations: [],
        });

        expect(res.profile.requisite).toMatchObject({
            recipient: '',
            edrpou: '',
            address: '',
            localizations: [],
        });

        expect(res.profile.socialLinks).toEqual([]);
    });

    it('publish() PUTs patch, refreshes languages and returns mapped profile', async () => {
        const client = {
            put: jest.fn(),
            get: jest.fn(),
        } as any;

        client.put.mockResolvedValue({
            data: {
                contacts: { phone: '+380501112233' },
                requisites: { recipient: 'Victory Center' },
                socialLinks: [{ socialPlatform: 0, url: 'https://instagram.com/a' }],
            },
        });

        client.get.mockResolvedValue({ data: [{ id: 1, code: 'uk', name: 'Ukrainian' }] });

        const res = await CompanyProfileApi.publish(client, validPatch as any);

        expect(client.put).toHaveBeenCalledWith(API_ROUTES.COMPANY_PROFILE.BASE, expect.any(Object));
        expect(client.get).toHaveBeenCalledWith(API_ROUTES.LOCALIZATION_LANGUAGE.BASE);

        expect(res.profile.contact).toMatchObject({
            phone: '+380501112233',
            localizations: [],
        });

        expect(res.profile.requisite).toMatchObject({
            recipient: 'Victory Center',
            localizations: [],
        });

        expect(res.profile.socialLinks[0].socialPlatform).toBe(0);
        expect(res.languages).toEqual([{ id: 1, code: 'uk', name: 'Ukrainian' }]);
    });

    it('publish() does not fail if languages refresh fails', async () => {
        const client = {
            put: jest.fn(),
            get: jest.fn(),
        } as any;

        const fallbackLanguages = [{ id: 2, code: 'en', name: 'English' }];

        client.put.mockResolvedValue({
            data: {
                contacts: { phone: '+380999999999' },
                requisites: { recipient: 'Victory Center NGO' },
                socialLinks: [],
            },
        });

        client.get.mockRejectedValue(new Error('Localization service unavailable'));

        const res = await CompanyProfileApi.publish(client, validPatch as any, fallbackLanguages as any);

        expect(client.put).toHaveBeenCalledWith(API_ROUTES.COMPANY_PROFILE.BASE, expect.any(Object));
        expect(client.get).toHaveBeenCalledWith(API_ROUTES.LOCALIZATION_LANGUAGE.BASE);

        expect(res.profile.contact).toMatchObject({
            phone: '+380999999999',
            localizations: [],
        });

        expect(res.profile.requisite).toMatchObject({
            recipient: 'Victory Center NGO',
            localizations: [],
        });

        expect(res.languages).toEqual(fallbackLanguages);
    });
});
