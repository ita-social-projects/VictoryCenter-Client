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

    it('should not display separator when resource is empty', () => {
        const eventWithoutResource = {
            ...mockEventData,
            resource: '',
        };
        render(<SingleEventNews {...eventWithoutResource} />);
        expect(screen.getByText(mockEventData.date)).toBeInTheDocument();
        expect(screen.queryByText(/\|/)).not.toBeInTheDocument();
    });

    it('should render correctly with empty tags array', () => {
        const eventWithoutTags = {
            ...mockEventData,
            tags: [],
        };
        render(<SingleEventNews {...eventWithoutTags} />);
        expect(screen.getByText(mockEventData.title)).toBeInTheDocument();
        expect(screen.getByText(mockEventData.description)).toBeInTheDocument();
    });

    it('should handle multiple tags correctly', () => {
        const eventWithMultipleTags = {
            ...mockEventData,
            tags: [
                { id: '1', name: 'Media' },
                { id: '2', name: 'News' },
                { id: '3', name: 'Event' },
            ],
        };
        render(<SingleEventNews {...eventWithMultipleTags} />);
        expect(screen.getByText('Media')).toBeInTheDocument();
        expect(screen.getByText('News')).toBeInTheDocument();
        expect(screen.getByText('Event')).toBeInTheDocument();
    });

    it('should use default values when optional props are not provided', () => {
        const minimalEventData: EventsNews = {
            id: '1',
            title: 'Minimal Event',
            date: '2026-05-15',
            imageURL: 'https://example.com/minimal.jpg',
            description: 'Minimal description',
            tags: [],
        };
        render(<SingleEventNews {...minimalEventData} />);
        expect(screen.getByText('Minimal Event')).toBeInTheDocument();
        expect(screen.getByText('Minimal description')).toBeInTheDocument();
        expect(screen.getByText('2026-05-15')).toBeInTheDocument();
    });

    it('should render event card with correct structure', () => {
        const { container } = render(<SingleEventNews {...mockEventData} />);
        const eventCard = container.querySelector('[class*="event-card"]');
        expect(eventCard).toBeInTheDocument();
        
        const eventImage = eventCard?.querySelector('[class*="event-image"]');
        const eventHeader = eventCard?.querySelector('[class*="event-header"]');
        const eventTitle = eventCard?.querySelector('[class*="event-title"]');
        const eventDescription = eventCard?.querySelector('[class*="event-description"]');

        expect(eventImage).toBeInTheDocument();
        expect(eventHeader).toBeInTheDocument();
        expect(eventTitle).toBeInTheDocument();
        expect(eventDescription).toBeInTheDocument();
    });

    it('should render with proper heading level h4 for title', () => {
        render(<SingleEventNews {...mockEventData} />);
        const heading = screen.getByRole('heading', { level: 4 });
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveTextContent(mockEventData.title);
    });
});
