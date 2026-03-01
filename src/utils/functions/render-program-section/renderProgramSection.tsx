import React from 'react';
import {
    FaqSectionQuestionDto,
    ProgramSectionContent,
    ProgramSectionTemplate,
    ProgramSectionMode,
} from '@/types/common/program-sections';
import { ImageValues, Image } from '@/types/common/image';
import { ContentType } from '@/types/common/programs';
import { QuadImagesBottom } from '@/components/common/program-section-templates/quad-images-bottom/QuadImagesBottom';
import { TripleImagesBottom } from '@/components/common/program-section-templates/triple-images-bottom/TripleImagesBottom';
import { DualImagesBottom } from '@/components/common/program-section-templates/dual-images-bottom/DualImagesBottom';
import { TextOnly } from '@/components/common/program-section-templates/text-only/TextOnly';
import { SingleImageTop } from '@/components/common/program-section-templates/single-image-top/SingleImageTop';
import { SingleImageBottom } from '@/components/common/program-section-templates/single-image-bottom/SingleImageBottom';
import { SingleImageRight } from '@/components/common/program-section-templates/single-image-right/SingleImageRight';
import { TitleDescriptionCardsWrapper } from '@/components/common/program-section-templates/title-description-cards/TitleDescriptionCardsWrapper';
import { SingleTitleQuintupleDescription } from '@/components/common/program-section-templates/single-title-quintuple-description/SingleTitleQuintupleDescription';
import { SingleTitleDescriptionAuthorPairs } from '@/components/common/program-section-templates/single-title-description-author-pairs/SingleTitleDescriptionAuthorPairs';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import { FaqProgramSection } from '@/components/common/program-section-templates/faq-program-section';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

export interface ProgramSectionCardData {
    title: string;
    description: string;
}

export interface DescriptionAuthorPairData {
    description: string;
    author: string;
}

export interface ProgramSectionData {
    title?: string;
    description?: string;
    descriptions?: string[];
    images?: (Image | ImageValues | null)[];
    cards?: ProgramSectionCardData[];
    descriptionAuthorPairs?: DescriptionAuthorPairData[];
    faqQuestions?: any[];
    faqPairs?: FaqSectionQuestionDto[];
}

export interface ProgramSectionHandlers {
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    onDescriptionsChange?: (index: number, value: string) => void;
    onImagesChange?: (index: number, file: ImageValues | null) => void;
    onCardTitleChange?: (index: number, value: string) => void;
    onCardDescriptionChange?: (index: number, value: string) => void;
    onCardAuthorChange?: (index: number, value: string) => void;
    onAddPair?: () => void;
    onDeletePair?: (index: number) => void;
    canAddPair?: boolean;
    onFaqQuestionChange?: (index: number, value: string) => void;
    onFaqAnswerChange?: (index: number, value: string) => void;
    onAddFaqPair?: (questionText: string, answerText: string) => void;
    onDeleteFaqPair?: (index: number) => void;
}

export interface RenderProgramSectionParams {
    templateId: ProgramSectionTemplate;
    data: ProgramSectionData;
    mode?: ProgramSectionMode;
    handlers?: ProgramSectionHandlers;
    validationResetKey?: number;
}

const createItem = (
    type: ContentType,
    order: number,
    overrides: Partial<ProgramSectionContent> = {},
): ProgramSectionContent => ({
    contentType: type,
    order,
    title: type === ContentType.Title ? '' : null,
    description: type === ContentType.Description ? '' : null,
    author: type === ContentType.Author ? '' : null,
    image: null,
    ...overrides,
});

const createBaseContents = (): ProgramSectionContent[] => [
    createItem(ContentType.Title, 0),
    createItem(ContentType.Description, 1),
];

const createImageContents = (count: number): ProgramSectionContent[] =>
    Array.from({ length: count }, (_, i) => createItem(ContentType.Image, 2 + i));

const createCardContents = (cardCount: number): ProgramSectionContent[] =>
    Array.from({ length: cardCount * 2 }, (_, index) =>
        createItem(index % 2 === 0 ? ContentType.Title : ContentType.Description, index, {
            groupIndex: Math.floor(index / 2),
        }),
    );

const IMAGE_COUNT_MAP: Partial<Record<ProgramSectionTemplate, number>> = {
    [ProgramSectionTemplate.TextOnly]: 0,
    [ProgramSectionTemplate.SingleImageTop]: 1,
    [ProgramSectionTemplate.SingleImageBottom]: 1,
    [ProgramSectionTemplate.SingleImageRight]: 1,
    [ProgramSectionTemplate.DualImagesBottom]: 2,
    [ProgramSectionTemplate.TripleImagesBottom]: 3,
    [ProgramSectionTemplate.QuadImagesBottom]: 4,
};

const CARD_COUNT_MAP: Partial<Record<ProgramSectionTemplate, number>> = {
    [ProgramSectionTemplate.DualTitleDescriptionPairs]: 2,
    [ProgramSectionTemplate.TripleTitleDescriptionPairs]: 3,
    [ProgramSectionTemplate.QuadTitleDescriptionPairs]: 4,
};

const SINGLE_IMAGE_TEMPLATES = new Set<ProgramSectionTemplate>([
    ProgramSectionTemplate.SingleImageTop,
    ProgramSectionTemplate.SingleImageBottom,
    ProgramSectionTemplate.SingleImageRight,
]);

interface StandardTemplateProps {
    title?: string;
    description?: string;
    mode?: ProgramSectionMode;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    validationResetKey?: number;
}

type StandardTemplateComponentProps =
    | (StandardTemplateProps & {
          image?: Image | ImageValues | null;
          onImageChange?: (file: ImageValues | null) => void;
      })
    | (StandardTemplateProps & {
          images?: (Image | ImageValues | null)[];
          onImagesChange?: (index: number, file: ImageValues | null) => void;
      });

const STANDARD_TEMPLATES_MAP: Partial<
    Record<ProgramSectionTemplate, React.ComponentType<StandardTemplateComponentProps>>
> = {
    [ProgramSectionTemplate.TextOnly]: TextOnly,
    [ProgramSectionTemplate.SingleImageTop]: SingleImageTop,
    [ProgramSectionTemplate.SingleImageBottom]: SingleImageBottom,
    [ProgramSectionTemplate.SingleImageRight]: SingleImageRight,
    [ProgramSectionTemplate.DualImagesBottom]: DualImagesBottom,
    [ProgramSectionTemplate.TripleImagesBottom]: TripleImagesBottom,
    [ProgramSectionTemplate.QuadImagesBottom]: QuadImagesBottom,
};

export const getInitialSectionContents = (templateId: ProgramSectionTemplate): ProgramSectionContent[] => {
    if (templateId === ProgramSectionTemplate.SingleTitleDescriptionAuthorPairs) {
        return [
            createItem(ContentType.Title, 0, {
                title: PROGRAMS_TEXT.SECTION.SINGLE_TITLE_DESCRIPTION_AUTHOR_PAIRS.DEFAULT_TITLE,
            } as any),
            createItem(ContentType.Description, 1, { groupIndex: 0 }),
            createItem(ContentType.Author, 2, { groupIndex: 0 }),
        ];
    }

    if (templateId === ProgramSectionTemplate.SingleTitleQuestionAnswerPairs) {
        return [
            createItem(ContentType.Title, 0, {
                title: COMMON_TEXT_ADMIN.TAB.FAQ,
            } as any),
            createItem(ContentType.FaqQuestion, 1, {
                groupIndex: 0,
                faqQuestion: {
                    questionText: '',
                    answerText: '',
                } as any,
            } as any),
        ];
    }

    const cardCount = CARD_COUNT_MAP[templateId];
    if (cardCount) return createCardContents(cardCount);

    if (templateId === ProgramSectionTemplate.SingleTitleQuintupleDescription) {
        return [
            createItem(ContentType.Title, 0),
            ...Array.from({ length: 5 }, (_, i) => createItem(ContentType.Description, i + 1)),
        ];
    }

    const imageCount = IMAGE_COUNT_MAP[templateId] ?? 0;
    return [...createBaseContents(), ...createImageContents(imageCount)];
};

export const renderProgramSection = ({
    templateId,
    data,
    mode = ProgramSectionMode.View,
    handlers,
    validationResetKey,
}: RenderProgramSectionParams): React.ReactElement | null => {
    const cardCount = CARD_COUNT_MAP[templateId];
    if (cardCount) {
        return (
            <TitleDescriptionCardsWrapper
                cards={data.cards ?? []}
                cardsCount={cardCount}
                mode={mode}
                onTitleChange={handlers?.onCardTitleChange}
                onDescriptionChange={handlers?.onCardDescriptionChange}
                validationResetKey={validationResetKey}
            />
        );
    }

    if (templateId === ProgramSectionTemplate.SingleTitleDescriptionAuthorPairs) {
        return (
            <SingleTitleDescriptionAuthorPairs
                title={data.title}
                pairs={data.descriptionAuthorPairs ?? []}
                mode={mode}
                onTitleChange={handlers?.onTitleChange}
                onPairDescriptionChange={handlers?.onCardDescriptionChange}
                onPairAuthorChange={handlers?.onCardAuthorChange}
                onAddPair={handlers?.onAddPair}
                onDeletePair={handlers?.onDeletePair}
                canAddPair={handlers?.canAddPair}
            />
        );
    }

    if (templateId === ProgramSectionTemplate.SingleTitleQuestionAnswerPairs) {
        return (
            <FaqProgramSection
                questions={data.faqQuestions ?? []}
                mode={mode}
                title={data.title}
                onTitleChange={handlers?.onTitleChange}
                faqPairs={data.faqPairs ?? []}
                onFaqQuestionChange={handlers?.onFaqQuestionChange}
                onFaqAnswerChange={handlers?.onFaqAnswerChange}
                onAddFaqPair={handlers?.onAddFaqPair}
                onDeleteFaqPair={handlers?.onDeleteFaqPair}
                validationResetKey={validationResetKey}
            />
        );
    }

    if (templateId === ProgramSectionTemplate.SingleTitleQuintupleDescription) {
        const descriptions = data.descriptions ?? (data.description ? [data.description] : []);

        return (
            <SingleTitleQuintupleDescription
                title={data.title}
                descriptions={descriptions}
                mode={mode}
                onTitleChange={handlers?.onTitleChange}
                onDescriptionsChange={handlers?.onDescriptionsChange}
            />
        );
    }

    const Component = STANDARD_TEMPLATES_MAP[templateId];
    if (!Component) return null;

    const baseProps: StandardTemplateProps = {
        title: data.title,
        description: data.description,
        mode,
        onTitleChange: handlers?.onTitleChange,
        onDescriptionChange: handlers?.onDescriptionChange,
        validationResetKey,
    };

    if (SINGLE_IMAGE_TEMPLATES.has(templateId)) {
        const onImagesChange = handlers?.onImagesChange;

        return (
            <Component
                {...baseProps}
                image={data.images?.[0]}
                onImageChange={onImagesChange ? (file) => onImagesChange(0, file) : undefined}
            />
        );
    }

    return <Component {...baseProps} images={data.images} onImagesChange={handlers?.onImagesChange} />;
};
