import cn from 'classnames';
import {
    TitleDescriptionCardsSection,
    TitleDescriptionCardData,
} from '../shared/title-description-cards/TitleDescriptionCardsSection';
import styles from './QuadTitleDescription.module.scss';

interface QuadTitleDescriptionProps {
    cards: TitleDescriptionCardData[];
    isTemplate?: boolean;
    isEditable?: boolean;
    onTitleChange?: (index: number, value: string) => void;
    onDescriptionChange?: (index: number, value: string) => void;
}

export const QuadTitleDescription = ({
    cards,
    isTemplate = false,
    isEditable = false,
    onTitleChange,
    onDescriptionChange,
}: QuadTitleDescriptionProps) => {
    return (
        <div
            className={cn(styles.container, {
                [styles.template]: isTemplate,
                [styles.editable]: isEditable,
            })}
        >
            <TitleDescriptionCardsSection
                cards={cards}
                cardsCount={4}
                isTemplate={isTemplate}
                isEditable={isEditable}
                onTitleChange={onTitleChange}
                onDescriptionChange={onDescriptionChange}
            />
        </div>
    );
};
