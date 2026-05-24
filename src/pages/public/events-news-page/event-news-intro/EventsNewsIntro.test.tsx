import { EventsNewsIntro } from './EventsNewsIntro';
import { render, screen } from '@testing-library/react';
import { eventsNewsPageMock } from '@/utils/mock-data/public/event-news';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: { [key: string]: string } = {
                'SLOGAN.MOMENTS': 'Moments',
                'SLOGAN.AND': 'and',
                'SLOGAN.CHANGES': 'Changes',
            };
            return translations[key] || key;
        },
    }),
}));

describe('EventsNewsIntro', () => {
    it('renders the description correctly', () => {
        render(<EventsNewsIntro description={eventsNewsPageMock.description} />);
        const descriptionElement = screen.getByText(eventsNewsPageMock.description);
        expect(descriptionElement).toBeInTheDocument();
    });

    it('renders the h1 heading with slogan text', () => {
        render(<EventsNewsIntro description={eventsNewsPageMock.description} />);
        const heading = screen.getByRole('heading', { level: 1 });
        expect(heading).toBeInTheDocument();
    });

    it('renders all slogan span elements with translations', () => {
        render(<EventsNewsIntro description={eventsNewsPageMock.description} />);
        expect(screen.getByText('Moments')).toBeInTheDocument();
        expect(screen.getByText('and')).toBeInTheDocument();
        expect(screen.getByText('Changes')).toBeInTheDocument();
    });

    it('renders description as a paragraph element', () => {
        render(<EventsNewsIntro description={eventsNewsPageMock.description} />);
        const paragraph = screen.getByText(eventsNewsPageMock.description).closest('p');
        expect(paragraph).toBeInTheDocument();
    });

    it('renders with correct semantic HTML structure', () => {
        const { container } = render(<EventsNewsIntro description={eventsNewsPageMock.description} />);
        const section = container.querySelector('section');
        const div = section?.querySelector('div');
        const heading = div?.querySelector('h1');
        const paragraph = div?.querySelector('p');

        expect(section).toBeInTheDocument();
        expect(div).toBeInTheDocument();
        expect(heading).toBeInTheDocument();
        expect(paragraph).toBeInTheDocument();
    });

    it('renders line break in the slogan', () => {
        const { container } = render(<EventsNewsIntro description={eventsNewsPageMock.description} />);
        const brElement = container.querySelector('h1 br');
        expect(brElement).toBeInTheDocument();
    });

    it('renders multiple span elements with correct content', () => {
        const { container } = render(<EventsNewsIntro description={eventsNewsPageMock.description} />);
        const spans = container.querySelectorAll('h1 span');
        expect(spans.length).toBeGreaterThanOrEqual(3);
    });
});
