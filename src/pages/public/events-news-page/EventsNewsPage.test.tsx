import { render } from '@testing-library/react';
import { EventsNewsPage } from './EventsNewsPage';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { EventsNewsPageData } from '@/types/public/events-news';
import { EventsNewsIntro } from './event-news-intro/EventsNewsIntro';
import { Events } from './events/Events';
import { ChooseProgram } from './choose-program/ChooseProgram';

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

const mockedUseDataFetch = useDataFetch as jest.Mock;

const mockEventsNewsPageData: EventsNewsPageData = {
    description: 'Events and News description',
    chooseProgram: {
        title: 'Choose Program',
        description: 'Select a program that suits you',
        imgURL: 'https://example.com/image.jpg',
    },
    eventsData: {
        title: 'Events',
        tags: [
            { id: '1', name: 'News' },
            { id: '2', name: 'Events' },
        ],
    },
};

describe('EventsNewsPage component', () => {
    it('should render all child components', () => {
        mockedUseDataFetch.mockReturnValue({
            data: mockEventsNewsPageData,
            isLoading: false,
            error: null,
        });

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
                ...mockEventsNewsPageData.chooseProgram,
            }),
            undefined,
        );
    });
});
