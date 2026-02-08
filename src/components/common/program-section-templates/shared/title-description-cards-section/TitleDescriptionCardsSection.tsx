import cn from 'classnames';
import { TitleDescriptionCard } from './TitleDescriptionCard';
import { ProgramSectionMode } from '@/types/common/program-sections';
import styles from './TitleDescriptionCardsSection.module.scss';

export interface TitleDescriptionCardData {
    title: string;
    description: string;
}

interface Props {
    cards: TitleDescriptionCardData[];
    cardsCount: number;
    mode?: ProgramSectionMode;
    onTitleChange?: (index: number, value: string) => void;
    onDescriptionChange?: (index: number, value: string) => void;
    validationResetKey?: number;
}

export const TitleDescriptionCardsSection = ({
    cards,
    cardsCount,
    mode = ProgramSectionMode.Published,
    onTitleChange,
    onDescriptionChange,
    validationResetKey,
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
                [styles['td-cards--editable']]: mode === ProgramSectionMode.Edit || mode === ProgramSectionMode.View,
            })}
        >
            {normalizedCards.map((card, index) => (
                <TitleDescriptionCard
                    key={index}
                    card={card}
                    index={index}
                    mode={mode}
                    onTitleChange={onTitleChange}
                    onDescriptionChange={onDescriptionChange}
                    validationResetKey={validationResetKey}
                />
            ))}
        </div>
    );
};
