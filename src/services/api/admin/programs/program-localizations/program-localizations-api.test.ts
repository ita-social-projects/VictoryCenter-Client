import { ProgramLocalizationsApi } from './program-localizations-api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';

describe('ProgramLocalizationsApi', () => {
    it('calls client.post with correct url and returns data on create', async () => {
        const mockData = { id: 1, name: 'loc' } as any;
        const client: any = {
            post: jest.fn().mockResolvedValue({ data: mockData }),
        };

        const payload = { entityId: 10, languageId: 2, name: 'Name', sections: [] } as any;

        const result = await ProgramLocalizationsApi.create(client, payload);

        expect(client.post).toHaveBeenCalledWith(API_ROUTES.PROGRAM_LOCALIZATIONS.BASE, payload);
        expect(result).toBe(mockData);
    });

    it('calls client.put with correct url and returns data on update', async () => {
        const mockData = { id: 1, name: 'loc-updated' } as any;
        const client: any = {
            put: jest.fn().mockResolvedValue({ data: mockData }),
        };

        const entityId = 10;
        const languageId = 2;
        const payload = { name: 'Updated', sections: [] } as any;

        const result = await ProgramLocalizationsApi.update(client, entityId, languageId, payload);

        expect(client.put).toHaveBeenCalledWith(
            `${API_ROUTES.PROGRAM_LOCALIZATIONS.BASE}/${entityId}/${languageId}`,
            payload,
        );
        expect(result).toBe(mockData);
    });
});
