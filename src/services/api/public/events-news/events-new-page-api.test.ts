import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { mapToEventsNewsPage } from '@/utils/functions/mappers/public/event-news/events-news-page';
import { axiosInstance } from '@/services/api/axios';
import { EventsNewsPageApi } from './events-new-page-api';

jest.mock('@/services/api/axios', () => ({
    axiosInstance: { get: jest.fn() },
}));

jest.mock('@/utils/functions/mappers/public/event-news/events-news-page', () => ({
    mapToEventsNewsPage: jest.fn(),
}));

const mockedAxiosGet = axiosInstance.get as jest.Mock;
const mockedMapper = mapToEventsNewsPage as jest.Mock;

describe('EventsNewsPageApi', () => {
    const dto = { eventsBlockTitle: 'Title', pageDescription: 'Description', categories: [] };
    const mapped = { description: 'mapped', chooseProgram: {}, eventsData: { tags: [] } };

    beforeEach(() => {
        jest.clearAllMocks();
        mockedMapper.mockReturnValue(mapped);
        mockedAxiosGet.mockResolvedValue({ data: dto });
    });

    it('requests the public events page endpoint', async () => {
        await EventsNewsPageApi.get();

        expect(mockedAxiosGet).toHaveBeenCalledTimes(1);
        expect(mockedAxiosGet).toHaveBeenCalledWith(API_ROUTES.EVENTS_PAGE.PUBLIC, { signal: undefined });
    });

    it('maps the response with the default locale', async () => {
        const result = await EventsNewsPageApi.get();

        expect(mockedMapper).toHaveBeenCalledWith(dto, DEFAULT_LOCALE);
        expect(result).toBe(mapped);
    });

    it('maps the response with the provided language code', async () => {
        await EventsNewsPageApi.get('en');

        expect(mockedMapper).toHaveBeenCalledWith(dto, 'en');
    });

    it('passes the cancellation signal to axios', async () => {
        const { signal } = new AbortController();

        await EventsNewsPageApi.get('uk', { cancellationSignal: signal });

        expect(mockedAxiosGet).toHaveBeenCalledWith(API_ROUTES.EVENTS_PAGE.PUBLIC, { signal });
    });

    it('rejects when the request fails', async () => {
        mockedAxiosGet.mockRejectedValue(new Error('Network'));

        await expect(EventsNewsPageApi.get()).rejects.toThrow('Network');
        expect(mockedMapper).not.toHaveBeenCalled();
    });
});
