import cn from 'classnames';
import {
    TitleDescriptionCardsSection,
    TitleDescriptionCardData,
} from '../shared/title-description-cards-section/TitleDescriptionCardsSection';
import { SectionMode } from '@/types/common/sections';
import styles from './TitleDescriptionCardsWrapper.module.scss';

interface TitleDescriptionCardsWrapperProps {
    cards: TitleDescriptionCardData[];
    cardsCount: number;
    mode?: SectionMode;
    onTitleChange?: (index: number, value: string) => void;
    onDescriptionChange?: (index: number, value: string) => void;
    validationResetKey?: number;
}

export const TitleDescriptionCardsWrapper = ({
    cards,
    cardsCount,
    mode = SectionMode.View,
    onTitleChange,
    onDescriptionChange,
    validationResetKey,
}: TitleDescriptionCardsWrapperProps) => {
    return (
        <div
            className={cn(styles.container, {
                [styles['container--editable']]: mode === SectionMode.Edit,
                [styles['container--template']]: mode === SectionMode.Template,
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
