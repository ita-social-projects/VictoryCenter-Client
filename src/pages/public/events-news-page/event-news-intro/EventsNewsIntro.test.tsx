import { EventsNewsIntro } from './EventsNewsIntro';
import { render, screen } from '@testing-library/react';
import { eventsNewsMock } from '@/utils/mock-data/public/event-news';

describe('EventsNewsIntro', () => {
    it('renders the description correctly', () => {
        render(<EventsNewsIntro description={eventsNewsMock.description} />);
        const descriptionElement = screen.getByText(eventsNewsMock.description);
        expect(descriptionElement).toBeInTheDocument();
    });
});
