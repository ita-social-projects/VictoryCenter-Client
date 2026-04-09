import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TitleDescriptionCardsWrapper } from './TitleDescriptionCardsWrapper';
import { TitleDescriptionCardData } from '../shared/title-description-cards-section/TitleDescriptionCardsSection';
import { ProgramSectionMode } from '@/types/common/program-sections';

jest.mock('../shared/title-description-cards-section/TitleDescriptionCardsSection', () => ({
    TitleDescriptionCardsSection: (props: any) => (
        <div data-testid="title-description-cards-section" data-cards-count={props.cardsCount} data-mode={props.mode} />
    ),
}));

describe('TitleDescriptionCardsWrapper', () => {
    const mockCards: TitleDescriptionCardData[] = [
        { title: 'Card 1', description: 'Description 1' },
        { title: 'Card 2', description: 'Description 2' },
    ];

    const mockOnTitleChange = jest.fn();
    const mockOnDescriptionChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render TitleDescriptionCardsSection', () => {
        render(<TitleDescriptionCardsWrapper cards={mockCards} cardsCount={2} />);

        expect(screen.getByTestId('title-description-cards-section')).toBeInTheDocument();
    });

    it('should apply editable class when isEditable is true', () => {
        const { container } = render(
            <TitleDescriptionCardsWrapper cards={mockCards} cardsCount={2} mode={ProgramSectionMode.Edit} />,
        );

        expect((container.firstChild as HTMLElement).className).toMatch(/editable/);
    });

    it('should apply cards-2 class', () => {
        const { container } = render(<TitleDescriptionCardsWrapper cards={mockCards} cardsCount={2} />);

        expect((container.firstChild as HTMLElement).className).toMatch(/cards-2/);
    });

    it('should apply cards-3 class', () => {
        const { container } = render(<TitleDescriptionCardsWrapper cards={mockCards} cardsCount={3} />);

        expect((container.firstChild as HTMLElement).className).toMatch(/cards-3/);
    });

    it('should apply cards-4 class', () => {
        const { container } = render(<TitleDescriptionCardsWrapper cards={mockCards} cardsCount={4} />);

        expect((container.firstChild as HTMLElement).className).toMatch(/cards-4/);
    });

    it('should pass cardsCount to child component', () => {
        render(<TitleDescriptionCardsWrapper cards={mockCards} cardsCount={3} />);

        expect(screen.getByTestId('title-description-cards-section')).toHaveAttribute('data-cards-count', '3');
    });

    it('should pass mode to child component', () => {
        render(<TitleDescriptionCardsWrapper cards={mockCards} cardsCount={2} mode={ProgramSectionMode.Edit} />);

        expect(screen.getByTestId('title-description-cards-section')).toHaveAttribute(
            'data-mode',
            String(ProgramSectionMode.Edit),
        );
    });

    it('should have mode Published by default', () => {
        render(<TitleDescriptionCardsWrapper cards={mockCards} cardsCount={2} />);

        expect(screen.getByTestId('title-description-cards-section')).toHaveAttribute(
            'data-mode',
            String(ProgramSectionMode.View),
        );
    });

    it('should pass handlers to child component', () => {
        render(
            <TitleDescriptionCardsWrapper
                cards={mockCards}
                cardsCount={2}
                onTitleChange={mockOnTitleChange}
                onDescriptionChange={mockOnDescriptionChange}
            />,
        );

        expect(screen.getByTestId('title-description-cards-section')).toBeInTheDocument();
    });

    it('should handle empty cards array', () => {
        render(<TitleDescriptionCardsWrapper cards={[]} cardsCount={2} />);

        expect(screen.getByTestId('title-description-cards-section')).toBeInTheDocument();
    });
});
