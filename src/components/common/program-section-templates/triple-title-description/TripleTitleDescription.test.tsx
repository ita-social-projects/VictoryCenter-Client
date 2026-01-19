import { render, screen } from '@testing-library/react';
import { TripleTitleDescription } from './TripleTitleDescription';
import { TitleDescriptionCardData } from '../shared/title-description-cards/TitleDescriptionCardsSection';

const cardsMock: TitleDescriptionCardData[] = [
    { title: 'Title 1', description: 'Desc 1' },
    { title: 'Title 2', description: 'Desc 2' },
    { title: 'Title 3', description: 'Desc 3' },
];

describe('TripleTitleDescription', () => {
    it('renders correctly with cards', () => {
        render(<TripleTitleDescription cards={cardsMock} />);
        expect(screen.getByText('Title 1')).toBeInTheDocument();
        expect(screen.getByText('Desc 3')).toBeInTheDocument();
    });

    it('applies isEditable class', () => {
        const { container } = render(<TripleTitleDescription cards={cardsMock} isEditable />);
        expect(container.firstChild).toHaveClass('editable');
    });
});
