import { render } from '@testing-library/react';
import { EventsNewsPage } from './EventsNewsPage';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { EventsNewsPageApi } from '@/services/api/public/events-news/events-new-page-api';
import { EventsNewsPageData } from '@/types/public/events-news';
import { EventsNewsIntro } from './event-news-intro/EventsNewsIntro';
import { Events } from './events/Events';
import { ChooseProgram } from './choose-program/ChooseProgram';
import { DEFAULT_LOCALE, LOCALES } from '@/const/common/locales';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

jest.mock('@/hooks/common/use-data-fetch/useDataFetch');

jest.mock('./event-news-intro/EventsNewsIntro', () => ({
    EventsNewsIntro: jest.fn(() => null),
}));

jest.mock('./events/Events', () => ({
    Events: jest.fn(() => null),
}));

jest.mock('./choose-program/ChooseProgram', () => ({
    ChooseProgram: jest.fn(() => null),
}));

let mockCurrentLanguage = DEFAULT_LOCALE;

jest.mock('@/hooks/common/use-locale/useLocale', () => ({
    useLocale: () => ({ currentLanguage: mockCurrentLanguage }),
}));

jest.mock('@/services/api/public/events-news/events-new-page-api', () => ({
    EventsNewsPageApi: { get: jest.fn() },
}));

const mockedUseDataFetch = useDataFetch as jest.Mock;
const mockedPageApiGet = EventsNewsPageApi.get as jest.Mock;

const mockEventsNewsPageData: EventsNewsPageData = {
    description: 'Events and News description',
    eventsData: {
        title: 'Events',
        tags: [
            { id: '1', name: 'News' },
            { id: '2', name: 'Events' },
        ],
    },
};

describe('EventsNewsPage component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCurrentLanguage = DEFAULT_LOCALE;
        mockedUseDataFetch.mockReturnValue({
            data: mockEventsNewsPageData,
            isLoading: false,
            error: null,
        });
    });

    it('should render all child components with the fetched data', () => {
        render(<EventsNewsPage />);

        expect(EventsNewsIntro).toHaveBeenCalledWith(
            expect.objectContaining({
                description: mockEventsNewsPageData.description,
            }),
            undefined,
        );
        expect(Events).toHaveBeenCalledWith(
            expect.objectContaining({
                ...mockEventsNewsPageData.eventsData,
            }),
            undefined,
        );
        expect(ChooseProgram).toHaveBeenCalledWith(
            expect.objectContaining({
                title: 'CHOOSE_PROGRAM_TITLE',
                description: 'CHOOSE_PROGRAM_DESCRIPTION',
            }),
            undefined,
        );
    });

    it('should not render the child components while there is no data', () => {
        mockedUseDataFetch.mockReturnValue({ data: null, isLoading: true, error: null });

        render(<EventsNewsPage />);

        expect(EventsNewsIntro).not.toHaveBeenCalled();
        expect(Events).not.toHaveBeenCalled();
        expect(ChooseProgram).not.toHaveBeenCalled();
    });

    describe('localization', () => {
        it.each(LOCALES)('should use "%s" as the fetch dependency', (language) => {
            mockCurrentLanguage = language;

            render(<EventsNewsPage />);

            expect(mockedUseDataFetch).toHaveBeenCalledWith(
                expect.objectContaining({ autoFetchDependencies: [language] }),
            );
        });

        it.each(LOCALES)('should request the page data for "%s"', async (language) => {
            mockCurrentLanguage = language;
            mockedPageApiGet.mockResolvedValue(mockEventsNewsPageData);

            render(<EventsNewsPage />);

            const { fetchHandler } = mockedUseDataFetch.mock.calls[0][0];
            const requestOptions = { cancellationSignal: new AbortController().signal };

            await fetchHandler(requestOptions);

            expect(mockedPageApiGet).toHaveBeenCalledWith(language, requestOptions);
        });
    });
});
