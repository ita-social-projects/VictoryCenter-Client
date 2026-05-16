import { render, screen } from '@testing-library/react';
import { SingleEventNews } from './SingleEventNews';
import { EventsNews } from '@/types/public/events-news';
import { PUBLIC_ROUTES } from '@/const/public/routes';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

const mockEventData: EventsNews = {
    id: '1',
    title: 'Test Event',
    date: '2026-05-15',
    description: 'This is a test event description',
    imageURL: 'https://example.com/image.jpg',
    tags: [{ id: '1', name: 'Media' }],
    resource: 'Test Source',
};

describe('SingleEventNews', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render event image, title, date, and description', () => {
        render(<SingleEventNews {...mockEventData} />);
        const image = screen.getByRole('img', { name: /event/i });

        expect(image).toBeInTheDocument();
        expect(image).toHaveAttribute('src', mockEventData.imageURL);
        expect(image).toHaveAttribute('alt', 'Event');
        expect(screen.getByText(mockEventData.title)).toBeInTheDocument();
        expect(screen.getByText(new RegExp(mockEventData.date))).toBeInTheDocument();
        expect(screen.getByText(mockEventData.description)).toBeInTheDocument();
    });

    it('should display resource and date with separator', () => {
        render(<SingleEventNews {...mockEventData} />);
        expect(screen.getByText(`${mockEventData.resource} | ${mockEventData.date}`)).toBeInTheDocument();
    });

    it('should render event tags', () => {
        render(<SingleEventNews {...mockEventData} />);
        expect(screen.getByText('Media')).toBeInTheDocument();
    });

    it('should render a link button to the events and news page', () => {
        render(<SingleEventNews {...mockEventData} />);
        const button = screen.getByRole('link', { name: /LINK_TO_ARTICLE/i });

        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('href', PUBLIC_ROUTES.EVENTS_AND_NEWS.FULL);
    });
});
