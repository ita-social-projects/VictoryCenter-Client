import cn from 'classnames';
import { TitleDescriptionCard } from './TitleDescriptionCard';
import styles from './TitleDescriptionCardsSection.module.scss';

export interface TitleDescriptionCardData {
    title: string;
    description: string;
}

interface Props {
    cards: TitleDescriptionCardData[];
    cardsCount: number;
    isEditable?: boolean;
    onTitleChange?: (index: number, value: string) => void;
    onDescriptionChange?: (index: number, value: string) => void;
}

export const TitleDescriptionCardsSection = ({
    cards,
    cardsCount,
    isEditable = false,
    onTitleChange,
    onDescriptionChange,
}: Props) => {
    const normalizedCards = Array.from({ length: cardsCount }).map(
        (_, index) => cards[index] ?? { title: '', description: '' },
    );

    return (
        <div
            className={cn(styles['td-cards'], {
                [styles['td-cards--dual']]: cardsCount === 2,
                [styles['td-cards--triple']]: cardsCount === 3,
                [styles['td-cards--quad']]: cardsCount === 4,
                [styles['td-cards--editable']]: isEditable,
            })}
        >
            {normalizedCards.map((card, index) => (
                <TitleDescriptionCard
                    key={index}
                    card={card}
                    index={index}
                    isEditable={isEditable}
                    onTitleChange={onTitleChange}
                    onDescriptionChange={onDescriptionChange}
                />
            ))}
        </div>
    );
};
