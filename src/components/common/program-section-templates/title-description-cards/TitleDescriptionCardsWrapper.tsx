import cn from 'classnames';
import {
    TitleDescriptionCardsSection,
    TitleDescriptionCardData,
} from '../shared/title-description-cards-section/TitleDescriptionCardsSection';
import { ProgramSectionMode } from '@/types/common/program-sections';
import styles from './TitleDescriptionCardsWrapper.module.scss';

interface TitleDescriptionCardsWrapperProps {
    cards: TitleDescriptionCardData[];
    cardsCount: number;
    mode?: ProgramSectionMode;
    onTitleChange?: (index: number, value: string) => void;
    onDescriptionChange?: (index: number, value: string) => void;
    validationResetKey?: number;
}

export const TitleDescriptionCardsWrapper = ({
    cards,
    cardsCount,
    mode = ProgramSectionMode.Published,
    onTitleChange,
    onDescriptionChange,
    validationResetKey,
}: TitleDescriptionCardsWrapperProps) => {
    return (
        <div
            className={cn(styles.container, {
                [styles['container--editable']]: mode === ProgramSectionMode.Edit,
                [styles['container--template']]: mode === ProgramSectionMode.Template,
                [styles[`container--cards-${cardsCount}`]]: true,
            })}
        >
            <TitleDescriptionCardsSection
                cards={cards}
                cardsCount={cardsCount}
                mode={mode}
                onTitleChange={onTitleChange}
                onDescriptionChange={onDescriptionChange}
                validationResetKey={validationResetKey}
            />
        </div>
    );
};
