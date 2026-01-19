import { render, screen } from '@testing-library/react';
import { DualTitleDescription } from './DualTitleDescription';
import { TitleDescriptionCardData } from '../shared/title-description-cards/TitleDescriptionCardsSection';

const cardsMock: TitleDescriptionCardData[] = [
    { title: 'Title 1', description: 'Desc 1' },
    { title: 'Title 2', description: 'Desc 2' },
];

describe('DualTitleDescription', () => {
    it('renders correctly with cards', () => {
        render(<DualTitleDescription cards={cardsMock} />);
        expect(screen.getByText('Title 1')).toBeInTheDocument();
        expect(screen.getByText('Desc 2')).toBeInTheDocument();
    });

    it('applies isEditable class', () => {
        const { container } = render(<DualTitleDescription cards={cardsMock} isEditable />);
        expect(container.firstChild).toHaveClass('editable');
    });
});
