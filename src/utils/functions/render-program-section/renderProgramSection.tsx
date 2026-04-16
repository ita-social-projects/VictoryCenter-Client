import React from 'react';
import { FaqSectionQuestionDto, CreateProgramSectionContentDto } from '@/types/common/program-sections';
import { SectionTemplate, SectionMode } from '@/types/common/sections';
import { ImageValues, Image } from '@/types/common/image';
import { ContentType } from '@/types/common/section-contents';
import { TitleDescriptionCardsWrapper } from '@/components/common/section-templates/title-description-cards/TitleDescriptionCardsWrapper';
import { SingleTitleQuintupleDescription } from '@/components/common/section-templates/single-title-quintuple-description/SingleTitleQuintupleDescription';
import { SingleTitleDescriptionAuthorPairs } from '@/components/common/section-templates/single-title-description-author-pairs/SingleTitleDescriptionAuthorPairs';
import { SECTIONS_TEXT } from '@/const/admin/sections';
import { FaqProgramSection } from '@/components/common/section-templates/faq-program-section';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { renderStandardSectionTemplate } from '@/utils/functions/render-standard-section-template';

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
    templateId: SectionTemplate;
    data: ProgramSectionData;
    mode?: SectionMode;
    handlers?: ProgramSectionHandlers;
    validationResetKey?: number;
}

const createItem = (
    type: ContentType,
    order: number,
    overrides: Partial<CreateProgramSectionContentDto> = {},
): CreateProgramSectionContentDto => ({
    contentType: type,
    order,
    title: type === ContentType.Title ? '' : null,
    description: type === ContentType.Description ? '' : null,
    author: type === ContentType.Author ? '' : null,
    image: null,
    ...overrides,
});

const createBaseContents = (): CreateProgramSectionContentDto[] => [
    createItem(ContentType.Title, 0),
    createItem(ContentType.Description, 1),
];

const createImageContents = (count: number): CreateProgramSectionContentDto[] =>
    Array.from({ length: count }, (_, i) => createItem(ContentType.Image, 2 + i));

const createCardContents = (cardCount: number): CreateProgramSectionContentDto[] =>
    Array.from({ length: cardCount * 2 }, (_, index) =>
        createItem(index % 2 === 0 ? ContentType.Title : ContentType.Description, index, {
            groupIndex: Math.floor(index / 2),
        }),
    );

const IMAGE_COUNT_MAP: Partial<Record<SectionTemplate, number>> = {
    [SectionTemplate.TextOnly]: 0,
    [SectionTemplate.SingleImageTop]: 1,
    [SectionTemplate.SingleImageBottom]: 1,
    [SectionTemplate.SingleImageRight]: 1,
    [SectionTemplate.DualImagesBottom]: 2,
    [SectionTemplate.TripleImagesBottom]: 3,
    [SectionTemplate.QuadImagesBottom]: 4,
};

const CARD_COUNT_MAP: Partial<Record<SectionTemplate, number>> = {
    [SectionTemplate.DualTitleDescriptionPairs]: 2,
    [SectionTemplate.TripleTitleDescriptionPairs]: 3,
    [SectionTemplate.QuadTitleDescriptionPairs]: 4,
};

export const getInitialSectionContents = (templateId: SectionTemplate): CreateProgramSectionContentDto[] => {
    if (templateId === SectionTemplate.SingleTitleDescriptionAuthorPairs) {
        return [
            createItem(ContentType.Title, 0, {
                title: SECTIONS_TEXT.SECTION.SINGLE_TITLE_DESCRIPTION_AUTHOR_PAIRS.DEFAULT_TITLE,
            } as any),
            createItem(ContentType.Description, 1, { groupIndex: 0 }),
            createItem(ContentType.Author, 2, { groupIndex: 0 }),
        ];
    }

    if (templateId === SectionTemplate.SingleTitleQuestionAnswerPairs) {
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

    if (templateId === SectionTemplate.SingleTitleQuintupleDescription) {
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
    mode = SectionMode.View,
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

    if (templateId === SectionTemplate.SingleTitleDescriptionAuthorPairs) {
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

    if (templateId === SectionTemplate.SingleTitleQuestionAnswerPairs) {
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
                canAddFaqPair={handlers?.canAddPair}
                validationResetKey={validationResetKey}
            />
        );
    }

    if (templateId === SectionTemplate.SingleTitleQuintupleDescription) {
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

    return renderStandardSectionTemplate({
        templateId,
        data,
        mode,
        handlers,
        validationResetKey,
    });
};
