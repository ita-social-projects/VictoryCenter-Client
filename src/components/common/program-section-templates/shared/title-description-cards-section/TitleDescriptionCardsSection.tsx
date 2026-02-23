import cn from 'classnames';
import { TitleDescriptionCard } from './TitleDescriptionCard';
import { ProgramSectionMode, ProgramSectionTemplate } from '@/types/common/program-sections';
import { getProgramSectionTemplateMaxGroupCount } from '@/utils/functions/program-section-template-validation/programSectionTemplateValidation';
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

const PAIRS_TEMPLATES = [
    ProgramSectionTemplate.DualTitleDescriptionPairs,
    ProgramSectionTemplate.TripleTitleDescriptionPairs,
    ProgramSectionTemplate.QuadTitleDescriptionPairs,
] as const;

const resolvePairsTemplateByCardsCount = (cardsCount: number): ProgramSectionTemplate =>
    PAIRS_TEMPLATES.find((t) => getProgramSectionTemplateMaxGroupCount(t) === cardsCount) ??
    ProgramSectionTemplate.DualTitleDescriptionPairs;

export const TitleDescriptionCardsSection = ({
    cards,
    cardsCount,
    mode = ProgramSectionMode.View,
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
                [styles['td-cards--editable']]: mode === ProgramSectionMode.Edit,
                [styles['td-cards--template']]: mode === ProgramSectionMode.Template,
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
