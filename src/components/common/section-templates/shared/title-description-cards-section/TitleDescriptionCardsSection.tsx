import cn from 'classnames';
import { TitleDescriptionCard } from './TitleDescriptionCard';
import { SectionMode, SectionTemplate } from '@/types/common/sections';
import { getSectionTemplateMaxGroupCount } from '@/utils/functions/program-section-template-validation/programSectionTemplateValidation';
import styles from './TitleDescriptionCardsSection.module.scss';

export interface TitleDescriptionCardData {
    title: string;
    description: string;
}

interface Props {
    cards: TitleDescriptionCardData[];
    cardsCount: number;
    mode?: SectionMode;
    onTitleChange?: (index: number, value: string) => void;
    onDescriptionChange?: (index: number, value: string) => void;
    validationResetKey?: number;
}

const PAIRS_TEMPLATES = [
    SectionTemplate.DualTitleDescriptionPairs,
    SectionTemplate.TripleTitleDescriptionPairs,
    SectionTemplate.QuadTitleDescriptionPairs,
] as const;

const resolvePairsTemplateByCardsCount = (cardsCount: number): SectionTemplate =>
    PAIRS_TEMPLATES.find((t) => getSectionTemplateMaxGroupCount(t) === cardsCount) ??
    SectionTemplate.DualTitleDescriptionPairs;

export const TitleDescriptionCardsSection = ({
    cards,
    cardsCount,
    mode = SectionMode.View,
    onTitleChange,
    onDescriptionChange,
    validationResetKey,
}: Props) => {
    const normalizedCards = Array.from({ length: cardsCount }).map(
        (_, index) => cards[index] ?? { title: '', description: '' },
    );

    const template = resolvePairsTemplateByCardsCount(cardsCount);

    return (
        <div
            className={cn(styles['td-cards'], {
                [styles['td-cards--dual']]: cardsCount === 2,
                [styles['td-cards--triple']]: cardsCount === 3,
                [styles['td-cards--quad']]: cardsCount === 4,
                [styles['td-cards--editable']]: mode === SectionMode.Edit,
                [styles['td-cards--template']]: mode === SectionMode.Template,
            })}
        >
            {normalizedCards.map((card, index) => (
                <TitleDescriptionCard
                    key={index}
                    card={card}
                    index={index}
                    template={template}
                    mode={mode}
                    onTitleChange={onTitleChange}
                    onDescriptionChange={onDescriptionChange}
                    validationResetKey={validationResetKey}
                />
            ))}
        </div>
    );
};
