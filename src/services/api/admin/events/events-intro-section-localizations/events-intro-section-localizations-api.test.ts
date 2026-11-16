import { AxiosInstance } from 'axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { EventsIntroSectionLocalizationsApi } from './events-intro-section-localizations-api';

describe('EventsIntroSectionLocalizationsApi', () => {
    const post = jest.fn();
    const put = jest.fn();
    const client = { post, put } as unknown as AxiosInstance;

    beforeEach(() => {
        post.mockReset();
        put.mockReset();
    });

    it('creates the first English localization with only the active field', async () => {
        const response = { entityId: 1, pageDescription: 'English description' };
        post.mockResolvedValueOnce({ data: response });

        await expect(
            EventsIntroSectionLocalizationsApi.create(client, {
                entityId: 1,
                languageId: 2,
                pageDescription: 'English description',
            }),
        ).resolves.toEqual(response);

        expect(post).toHaveBeenCalledWith(API_ROUTES.EVENTS_INTRO_SECTION_LOCALIZATIONS.BASE, {
            entityId: 1,
            languageId: 2,
            pageDescription: 'English description',
        });
    });

    it('partially updates an existing localization with only the active field', async () => {
        const response = { entityId: 1, eventsBlockTitle: 'English title' };
        put.mockResolvedValueOnce({ data: response });

        await expect(
            EventsIntroSectionLocalizationsApi.update(client, 1, 2, { eventsBlockTitle: 'English title' }),
        ).resolves.toEqual(response);

        expect(put).toHaveBeenCalledWith(`${API_ROUTES.EVENTS_INTRO_SECTION_LOCALIZATIONS.BASE}/1/2`, {
            eventsBlockTitle: 'English title',
        });
    });

    it('propagates API errors', async () => {
        const error = new Error('Request failed');
        post.mockRejectedValueOnce(error);

        await expect(
            EventsIntroSectionLocalizationsApi.create(client, {
                entityId: 1,
                languageId: 2,
                pageDescription: 'English description',
            }),
        ).rejects.toBe(error);
    });
});
