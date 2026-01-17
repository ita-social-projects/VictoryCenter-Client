import cn from 'classnames';
import {
    TitleDescriptionCardsSection,
    TitleDescriptionCardData,
} from '../shared/title-description-cards/TitleDescriptionCardsSection';
import styles from './DualTitleDescription.module.scss';

interface DualTitleDescriptionProps {
    cards: TitleDescriptionCardData[];
    isTemplate?: boolean;
    isEditable?: boolean;
    onTitleChange?: (index: number, value: string) => void;
    onDescriptionChange?: (index: number, value: string) => void;
}

export const DualTitleDescription = ({
    cards,
    isTemplate = false,
    isEditable = false,
    onTitleChange,
    onDescriptionChange,
}: DualTitleDescriptionProps) => {
    return (
        <div
            className={cn(styles.container, {
                [styles.template]: isTemplate,
                [styles.editable]: isEditable,
            })}
        >
            <TitleDescriptionCardsSection
                cards={cards}
                cardsCount={2}
                isTemplate={isTemplate}
                isEditable={isEditable}
                onTitleChange={onTitleChange}
                onDescriptionChange={onDescriptionChange}
            />
        </div>
    );
};
