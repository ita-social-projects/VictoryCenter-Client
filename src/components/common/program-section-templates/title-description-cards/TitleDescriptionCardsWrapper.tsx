import cn from 'classnames';
import {
    TitleDescriptionCardsSection,
    TitleDescriptionCardData,
} from '../shared/title-description-cards-section/TitleDescriptionCardsSection';
import styles from './TitleDescriptionCardsWrapper.module.scss';

interface TitleDescriptionCardsWrapperProps {
    cards: TitleDescriptionCardData[];
    cardsCount: number;
    isEditable?: boolean;
    onTitleChange?: (index: number, value: string) => void;
    onDescriptionChange?: (index: number, value: string) => void;
}

export const TitleDescriptionCardsWrapper = ({
    cards,
    cardsCount,
    isEditable = false,
    onTitleChange,
    onDescriptionChange,
}: TitleDescriptionCardsWrapperProps) => {
    return (
        <div
            className={cn(styles.container, {
                [styles.editable]: isEditable,
                [styles[`cards-${cardsCount}`]]: true,
            })}
        >
            <TitleDescriptionCardsSection
                cards={cards}
                cardsCount={cardsCount}
                isEditable={isEditable}
                onTitleChange={onTitleChange}
                onDescriptionChange={onDescriptionChange}
            />
        </div>
    );
};
