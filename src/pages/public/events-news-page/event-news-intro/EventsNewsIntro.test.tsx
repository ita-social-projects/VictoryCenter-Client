import { EventsNewsIntro } from './EventsNewsIntro';
import { render, screen } from '@testing-library/react';
import { eventsNewsPageMock } from '@/utils/mock-data/public/event-news';

describe('EventsNewsIntro', () => {
    it('renders the description correctly', () => {
        render(<EventsNewsIntro description={eventsNewsPageMock.description} />);
        const descriptionElement = screen.getByText(eventsNewsPageMock.description);
        expect(descriptionElement).toBeInTheDocument();
    });
});
