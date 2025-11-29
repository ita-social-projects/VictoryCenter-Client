import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ValueCard } from './ValueCard';
import { aboutUsPageUk } from '../../../../../../locales/uk';

jest.mock('../../../../../../const/public/about-us-page', () => ({
    ABOUT_US_DATA: {
        OUR_VALUES: 'Наші Цінності',
    },
}));

describe('ValueCard Component', () => {
    const mockGroup = [
        { name: 'Empathy', description: "We understand others' feelings." },
        { name: 'Diversity', description: "We value everyone's uniqueness." },
    ];

    const mockStylesModule = {
        'values-title': 'values-title',
        'value-card': 'value-card',
        'card-1': 'card-1',
        'card-2': 'card-2',
        'card-3': 'card-3',
        'value-item': 'value-item',
        'value-name': 'value-name',
        'value-description': 'value-description',
    };

    it('should render the title only for the first group (groupIndex === 0)', () => {
        render(<ValueCard group={mockGroup} groupIndex={0} stylesModule={mockStylesModule} />);
        const title = screen.getByRole('heading', { name: aboutUsPageUk.OUR_VALUES });
        expect(title).toBeInTheDocument();
        expect(title.closest('.values-title')).toBeInTheDocument();
    });

    it('should not render the title for groupIndex > 0', () => {
        render(<ValueCard group={mockGroup} groupIndex={1} stylesModule={mockStylesModule} />);
        const title = screen.queryByRole('heading', { name: aboutUsPageUk.OUR_VALUES });
        expect(title).not.toBeInTheDocument();
    });

    it('should render the correct number of value items', () => {
        render(<ValueCard group={mockGroup} groupIndex={0} stylesModule={mockStylesModule} />);
        const items = screen.getAllByRole('heading', { level: 3 });
        expect(items).toHaveLength(mockGroup.length);
    });

    it('should render correct text for each value item', () => {
        render(<ValueCard group={mockGroup} groupIndex={0} stylesModule={mockStylesModule} />);

        expect(screen.getByRole('heading', { name: 'Empathy' })).toBeInTheDocument();
        expect(screen.getByText("We understand others' feelings.")).toBeInTheDocument();

        expect(screen.getByRole('heading', { name: 'Diversity' })).toBeInTheDocument();
        expect(screen.getByText("We value everyone's uniqueness.")).toBeInTheDocument();
    });
});
