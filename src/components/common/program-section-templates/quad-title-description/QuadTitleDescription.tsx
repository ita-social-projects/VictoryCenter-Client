import cn from 'classnames';
import {
    TitleDescriptionCardsSection,
    TitleDescriptionCardData,
} from '../shared/title-description-cards/TitleDescriptionCardsSection';
import styles from './QuadTitleDescription.module.scss';

interface QuadTitleDescriptionProps {
    cards: TitleDescriptionCardData[];
    isEditable?: boolean;
    onTitleChange?: (index: number, value: string) => void;
    onDescriptionChange?: (index: number, value: string) => void;
}

export const QuadTitleDescription = ({
    cards,
    isEditable = false,
    onTitleChange,
    onDescriptionChange,
}: QuadTitleDescriptionProps) => {
    return (
        <div
            className={cn(styles.container, {
                [styles.editable]: isEditable,
            })}
        >
            <TitleDescriptionCardsSection
                cards={cards}
                cardsCount={4}
                isEditable={isEditable}
                onTitleChange={onTitleChange}
                onDescriptionChange={onDescriptionChange}
            />
        </div>
    );
};
