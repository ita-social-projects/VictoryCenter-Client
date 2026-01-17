import cn from 'classnames';
import { TitleDescriptionCard } from './TitleDescriptionCard';
import './TitleDescriptionCardsSection.scss';

export interface TitleDescriptionCardData {
    title: string;
    description: string;
}

interface Props {
    cards: TitleDescriptionCardData[];
    cardsCount: number;
    isTemplate?: boolean;
    isEditable?: boolean;
    onTitleChange?: (index: number, value: string) => void;
    onDescriptionChange?: (index: number, value: string) => void;
}

export const TitleDescriptionCardsSection = ({
    cards,
    cardsCount,
    isTemplate = false,
    isEditable = false,
    onTitleChange,
    onDescriptionChange,
}: Props) => {
    const normalizedCards = Array.from({ length: cardsCount }).map(
        (_, index) => cards[index] ?? { title: '', description: '' },
    );

    return (
        <div
            className={cn('td-cards', {
                dual: cardsCount === 2,
                triple: cardsCount === 3,
                quad: cardsCount === 4,
                template: isTemplate,
                editable: isEditable,
            })}
        >
            {normalizedCards.map((card, index) => (
                <TitleDescriptionCard
                    key={index}
                    card={card}
                    index={index}
                    isEditable={isEditable}
                    isTemplate={isTemplate}
                    onTitleChange={onTitleChange}
                    onDescriptionChange={onDescriptionChange}
                />
            ))}
        </div>
    );
};
