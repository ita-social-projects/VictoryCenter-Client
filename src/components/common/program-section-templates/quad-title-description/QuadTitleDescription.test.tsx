import { render, screen } from '@testing-library/react';
import { QuadTitleDescription } from './QuadTitleDescription';
import { TitleDescriptionCardData } from '../shared/title-description-cards/TitleDescriptionCardsSection';

const cardsMock: TitleDescriptionCardData[] = [
    { title: 'Title 1', description: 'Desc 1' },
    { title: 'Title 2', description: 'Desc 2' },
    { title: 'Title 3', description: 'Desc 3' },
    { title: 'Title 4', description: 'Desc 4' },
];

describe('QuadTitleDescription', () => {
    it('renders correctly with cards', () => {
        render(<QuadTitleDescription cards={cardsMock} />);
        expect(screen.getByText('Title 1')).toBeInTheDocument();
        expect(screen.getByText('Desc 4')).toBeInTheDocument();
    });

    it('applies isTemplate and isEditable classes', () => {
        const { container } = render(<QuadTitleDescription cards={cardsMock} isTemplate isEditable />);
        expect(container.firstChild).toHaveClass('template');
        expect(container.firstChild).toHaveClass('editable');
    });
});
