import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { TitleDescriptionCardsSection, type TitleDescriptionCardData } from '../TitleDescriptionCardsSection';
import { ProgramSectionMode } from '../../../../../../types/common/program-sections';

jest.mock('../TitleDescriptionCard', () => ({
    TitleDescriptionCard: ({ card, index, mode, onTitleChange, onDescriptionChange }: any) => {
        const React = require('react');
        const { ProgramSectionMode } = require('@/types/common/program-sections');
        const isEditable = mode === ProgramSectionMode.Edit;
        const [title, setTitle] = React.useState(card.title);
        const [description, setDescription] = React.useState(card.description);

        return (
            <div data-testid={`card-${index}`}>
                <input
                    data-testid={`title-input-${index}`}
                    aria-label={`Title ${index}`}
                    value={title}
                    readOnly={!isEditable}
                    onChange={(e) => {
                        setTitle(e.target.value);
                        onTitleChange?.(index, e.target.value);
                    }}
                />

                <input
                    data-testid={`description-input-${index}`}
                    aria-label={`Description ${index}`}
                    value={description}
                    readOnly={!isEditable}
                    onChange={(e) => {
                        setDescription(e.target.value);
                        onDescriptionChange?.(index, e.target.value);
                    }}
                />

                {!isEditable && <span data-testid={`template-${index}`}>Template</span>}
            </div>
        );
    },
}));

describe('TitleDescriptionCardsSection', () => {
    describe('rendering', () => {
        it('should render correct number of cards', () => {
            const cards: TitleDescriptionCardData[] = [
                { title: 'Title 1', description: 'Description 1' },
                { title: 'Title 2', description: 'Description 2' },
            ];

            render(<TitleDescriptionCardsSection cards={cards} cardsCount={2} />);

            expect(screen.getByTestId('card-0')).toBeInTheDocument();
            expect(screen.getByTestId('card-1')).toBeInTheDocument();
        });

        it('should render more cards than provided data', () => {
            const cards: TitleDescriptionCardData[] = [{ title: 'Title 1', description: 'Description 1' }];

            render(<TitleDescriptionCardsSection cards={cards} cardsCount={3} />);

            expect(screen.getByTestId('card-0')).toBeInTheDocument();
            expect(screen.getByTestId('card-1')).toBeInTheDocument();
            expect(screen.getByTestId('card-2')).toBeInTheDocument();
        });

        it('should fill missing cards with empty data', () => {
            const cards: TitleDescriptionCardData[] = [{ title: 'Title 1', description: 'Description 1' }];

            render(<TitleDescriptionCardsSection cards={cards} cardsCount={2} />);

            const titleInput1 = screen.getByTestId('title-input-1') as HTMLInputElement;
            const descriptionInput1 = screen.getByTestId('description-input-1') as HTMLInputElement;

            expect(titleInput1.value).toBe('');
            expect(descriptionInput1.value).toBe('');
        });
    });

    describe('card data', () => {
        it('should pass correct card data to child components', () => {
            const cards: TitleDescriptionCardData[] = [{ title: 'Test Title', description: 'Test Description' }];

            render(<TitleDescriptionCardsSection cards={cards} cardsCount={1} />);

            const titleInput = screen.getByTestId('title-input-0') as HTMLInputElement;
            const descriptionInput = screen.getByTestId('description-input-0') as HTMLInputElement;

            expect(titleInput.value).toBe('Test Title');
            expect(descriptionInput.value).toBe('Test Description');
        });

        it('should display multiple cards with different data', () => {
            const cards: TitleDescriptionCardData[] = [
                { title: 'Card 1 Title', description: 'Card 1 Description' },
                { title: 'Card 2 Title', description: 'Card 2 Description' },
                { title: 'Card 3 Title', description: 'Card 3 Description' },
            ];

            render(<TitleDescriptionCardsSection cards={cards} cardsCount={3} />);

            expect((screen.getByTestId('title-input-0') as HTMLInputElement).value).toBe('Card 1 Title');
            expect((screen.getByTestId('title-input-1') as HTMLInputElement).value).toBe('Card 2 Title');
            expect((screen.getByTestId('title-input-2') as HTMLInputElement).value).toBe('Card 3 Title');
        });
    });

    describe('editable mode', () => {
        it('should pass mode prop to child components', () => {
            const cards: TitleDescriptionCardData[] = [{ title: 'Title', description: 'Description' }];

            render(<TitleDescriptionCardsSection cards={cards} cardsCount={1} mode={ProgramSectionMode.Edit} />);

            const titleInput = screen.getByTestId('title-input-0') as HTMLInputElement;
            expect(titleInput).not.toHaveAttribute('readonly');
        });

        it('should not be editable when mode is Published', () => {
            const cards: TitleDescriptionCardData[] = [{ title: 'Title', description: 'Description' }];

            render(<TitleDescriptionCardsSection cards={cards} cardsCount={1} mode={ProgramSectionMode.View} />);

            const titleInput = screen.getByTestId('title-input-0') as HTMLInputElement;
            expect(titleInput).toHaveAttribute('readonly');
        });
    });

    describe('callbacks', () => {
        it('should call onTitleChange with correct index and value', async () => {
            const onTitleChange = jest.fn();
            const cards: TitleDescriptionCardData[] = [{ title: 'Original Title', description: 'Description' }];

            render(
                <TitleDescriptionCardsSection
                    cards={cards}
                    cardsCount={1}
                    mode={ProgramSectionMode.Edit}
                    onTitleChange={onTitleChange}
                />,
            );

            const titleInput = screen.getByTestId('title-input-0');
            await userEvent.clear(titleInput);
            await userEvent.type(titleInput, 'New Title');

            expect(onTitleChange).toHaveBeenLastCalledWith(0, 'New Title');
        });

        it('should call onDescriptionChange with correct index and value', async () => {
            const onDescriptionChange = jest.fn();
            const cards: TitleDescriptionCardData[] = [{ title: 'Title', description: 'Original Description' }];

            render(
                <TitleDescriptionCardsSection
                    cards={cards}
                    cardsCount={1}
                    mode={ProgramSectionMode.Edit}
                    onDescriptionChange={onDescriptionChange}
                />,
            );

            const descriptionInput = screen.getByTestId('description-input-0');
            await userEvent.clear(descriptionInput);
            await userEvent.type(descriptionInput, 'New Description');

            expect(onDescriptionChange).toHaveBeenLastCalledWith(0, 'New Description');
        });

        it('should call callbacks for multiple cards independently', async () => {
            const onTitleChange = jest.fn();
            const cards: TitleDescriptionCardData[] = [
                { title: 'Title 1', description: 'Description 1' },
                { title: 'Title 2', description: 'Description 2' },
            ];

            render(
                <TitleDescriptionCardsSection
                    cards={cards}
                    cardsCount={2}
                    mode={ProgramSectionMode.Edit}
                    onTitleChange={onTitleChange}
                />,
            );

            const titleInput0 = screen.getByTestId('title-input-0');
            const titleInput1 = screen.getByTestId('title-input-1');

            await userEvent.clear(titleInput0);
            await userEvent.type(titleInput0, 'Updated Title 1');
            await userEvent.clear(titleInput1);
            await userEvent.type(titleInput1, 'Updated Title 2');

            expect(onTitleChange).toHaveBeenLastCalledWith(1, 'Updated Title 2');

            expect(onTitleChange.mock.calls).toContainEqual([0, 'Updated Title 1']);
            expect(onTitleChange.mock.calls).toContainEqual([1, 'Updated Title 2']);
        });

        it('should not call callbacks when callbacks are not provided', () => {
            const cards: TitleDescriptionCardData[] = [{ title: 'Title', description: 'Description' }];

            const { container } = render(
                <TitleDescriptionCardsSection cards={cards} cardsCount={1} mode={ProgramSectionMode.Edit} />,
            );

            expect(container.querySelector('[data-testid="card-0"]')).toBeInTheDocument();
        });
    });

    describe('edge cases', () => {
        it('should handle empty cards array', () => {
            render(<TitleDescriptionCardsSection cards={[]} cardsCount={2} />);

            expect(screen.getByTestId('card-0')).toBeInTheDocument();
            expect(screen.getByTestId('card-1')).toBeInTheDocument();

            const titleInput0 = screen.getByTestId('title-input-0') as HTMLInputElement;
            const titleInput1 = screen.getByTestId('title-input-1') as HTMLInputElement;

            expect(titleInput0.value).toBe('');
            expect(titleInput1.value).toBe('');
        });

        it('should handle cardsCount of 0', () => {
            const cards: TitleDescriptionCardData[] = [{ title: 'Title', description: 'Description' }];

            const { container } = render(<TitleDescriptionCardsSection cards={cards} cardsCount={0} />);

            expect(container.querySelectorAll('[data-testid^="card-"]')).toHaveLength(0);
        });

        it('should handle cardsCount larger than cards array', () => {
            const cards: TitleDescriptionCardData[] = [{ title: 'Title 1', description: 'Description 1' }];

            render(<TitleDescriptionCardsSection cards={cards} cardsCount={5} />);

            expect(screen.getByTestId('card-0')).toBeInTheDocument();
            expect(screen.getByTestId('card-4')).toBeInTheDocument();
        });

        it('should be editable when mode is Edit', () => {
            const cards: TitleDescriptionCardData[] = [{ title: 'Title', description: 'Description' }];

            render(<TitleDescriptionCardsSection cards={cards} cardsCount={1} mode={ProgramSectionMode.Edit} />);

            const titleInput = screen.getByTestId('title-input-0') as HTMLInputElement;
            expect(titleInput).not.toHaveAttribute('readonly');
        });
    });
});
