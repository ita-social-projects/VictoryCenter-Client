import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ValueCard } from './ValueCard';
import { aboutUsPageUk } from '@/locales/uk';

jest.mock('./ValueCard.module.scss', () => ({
    title: 'title',
    column: 'column',
    card1: 'card1',
    card2: 'card2',
    card3: 'card3',
    item: 'item',
    name: 'name',
    description: 'description',
}));

jest.mock('@/const/public/about-us-page', () => ({
    ABOUT_US_DATA: {
        OUR_VALUES: 'Наші Цінності',
    },
}));

describe('ValueCard Component', () => {
    const mockGroup = [
        { name: 'Empathy', description: "We understand others' feelings." },
        { name: 'Diversity', description: "We value everyone's uniqueness." },
    ];

    it('should render the title only for the first group (groupIndex === 0)', () => {
        render(<ValueCard group={mockGroup} groupIndex={0} />);
        const title = screen.getByRole('heading', { name: aboutUsPageUk.OUR_VALUES });
        expect(title).toBeInTheDocument();
        expect(title.closest('.title')).toBeInTheDocument();
    });

    it('should not render the title for groupIndex > 0', () => {
        render(<ValueCard group={mockGroup} groupIndex={1} />);
        const title = screen.queryByRole('heading', { name: aboutUsPageUk.OUR_VALUES });
        expect(title).not.toBeInTheDocument();
    });

    it('should render the correct number of value items', () => {
        render(<ValueCard group={mockGroup} groupIndex={0} />);
        const items = screen.getAllByRole('heading', { level: 3 });
        expect(items).toHaveLength(mockGroup.length);
    });

    it('should render correct text for each value item', () => {
        render(<ValueCard group={mockGroup} groupIndex={0} />);
        expect(screen.getByRole('heading', { name: 'Empathy' })).toBeInTheDocument();
        expect(screen.getByText("We understand others' feelings.")).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Diversity' })).toBeInTheDocument();
        expect(screen.getByText("We value everyone's uniqueness.")).toBeInTheDocument();
    });
});
