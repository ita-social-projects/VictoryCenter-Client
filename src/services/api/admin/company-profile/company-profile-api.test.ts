import { CompanyProfileApi } from './company-profile-api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';

describe('CompanyProfileApi (real http)', () => {
    it('get() requests profile and languages', async () => {
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

        expect(res.profile.contact).toEqual({ phone: '+380' });
        expect(res.profile.requisite).toEqual({ recipient: 'VC' });
        expect(res.languages?.length).toBe(1);
    });

    it('publish() PUTs patch and returns mapped profile', async () => {
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

        const res = await CompanyProfileApi.publish(client, {
            contacts: {} as any,
            requisites: {} as any,
            socialLinks: [],
        });

        expect(client.put).toHaveBeenCalledWith(API_ROUTES.COMPANY_PROFILE.BASE, expect.any(Object));
        expect(client.get).toHaveBeenCalledWith(API_ROUTES.LOCALIZATION_LANGUAGE.BASE);

        expect(res.profile.contact.phone).toBe('+380501112233');
        expect(res.profile.requisite.recipient).toBe('Victory Center');
        expect(res.profile.socialLinks[0].socialPlatform).toBe(0);
    });
});
