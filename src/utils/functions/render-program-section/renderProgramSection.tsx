import React from 'react';
import { ProgramSectionContent, ProgramSectionTemplate, ProgramSectionMode } from '@/types/common/program-sections';
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

export interface ProgramSectionCardData {
    title: string;
    description: string;
}

export interface ProgramSectionData {
    title?: string;
    description?: string;
    descriptions?: string[];
    images?: (Image | ImageValues | null)[];
    cards?: ProgramSectionCardData[];
}

export interface ProgramSectionHandlers {
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    onDescriptionsChange?: (index: number, value: string) => void;
    onImagesChange?: (index: number, file: ImageValues | null) => void;
    onCardTitleChange?: (index: number, value: string) => void;
    onCardDescriptionChange?: (index: number, value: string) => void;
}

export interface RenderProgramSectionParams {
    templateId: ProgramSectionTemplate;
    data: ProgramSectionData;
    mode?: ProgramSectionMode;
    handlers?: ProgramSectionHandlers;
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
        createItem(index % 2 === 0 ? ContentType.Title : ContentType.Description, index),
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
    [ProgramSectionTemplate.DualTitleDescription]: 2,
    [ProgramSectionTemplate.TripleTitleDescription]: 3,
    [ProgramSectionTemplate.QuadTitleDescription]: 4,
};

const SINGLE_IMAGE_TEMPLATES = new Set<ProgramSectionTemplate>([
    ProgramSectionTemplate.SingleImageTop,
    ProgramSectionTemplate.SingleImageBottom,
    ProgramSectionTemplate.SingleImageRight,
]);

interface StandardTemplateProps {
    title?: string;
    description?: string;
    isTemplate?: boolean;
    isEditable?: boolean;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
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
    mode = ProgramSectionMode.Published,
    handlers,
}: RenderProgramSectionParams): React.ReactElement | null => {
    const cardCount = CARD_COUNT_MAP[templateId];
    if (cardCount) {
        return (
            <TitleDescriptionCardsWrapper
                cards={data.cards ?? []}
                cardsCount={cardCount}
                isEditable={isEditable}
                onTitleChange={handlers?.onCardTitleChange}
                onDescriptionChange={handlers?.onCardDescriptionChange}
            />
        );
    }

    if (templateId === ProgramSectionTemplate.SingleTitleQuintupleDescription) {
        const descriptions = data.descriptions ?? (data.description ? [data.description] : []);

        return (
            <SingleTitleQuintupleDescription
                title={data.title}
                descriptions={descriptions}
                isTemplate={isTemplate}
                isEditable={isEditable}
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
        isTemplate,
        isEditable,
        onTitleChange: handlers?.onTitleChange,
        onDescriptionChange: handlers?.onDescriptionChange,
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
    switch (templateId) {
        case ProgramSectionTemplate.QuadImagesBottom:
            return (
                <QuadImagesBottom
                    title={data.title}
                    description={data.description}
                    images={data.images}
                    mode={mode}
                    onTitleChange={handlers?.onTitleChange}
                    onDescriptionChange={handlers?.onDescriptionChange}
                    onImagesChange={handlers?.onImagesChange}
                />
            );
        case ProgramSectionTemplate.DualImagesBottom:
            return (
                <DualImagesBottom
                    title={data.title}
                    description={data.description}
                    images={data.images}
                    mode={mode}
                    onTitleChange={handlers?.onTitleChange}
                    onDescriptionChange={handlers?.onDescriptionChange}
                    onImagesChange={handlers?.onImagesChange}
                />
            );
        case ProgramSectionTemplate.TextOnly:
            return (
                <TextOnly
                    title={data.title}
                    description={data.description}
                    mode={mode}
                    onTitleChange={handlers?.onTitleChange}
                    onDescriptionChange={handlers?.onDescriptionChange}
                />
            );
        case ProgramSectionTemplate.TripleImagesBottom:
            return (
                <TripleImagesBottom
                    title={data.title}
                    description={data.description}
                    images={data.images}
                    mode={mode}
                    onTitleChange={handlers?.onTitleChange}
                    onDescriptionChange={handlers?.onDescriptionChange}
                    onImagesChange={handlers?.onImagesChange}
                />
            );
        case ProgramSectionTemplate.SingleImageBottom:
            return (
                <SingleImageBottom
                    title={data.title}
                    description={data.description}
                    image={data.images?.[0]}
                    mode={mode}
                    onTitleChange={handlers?.onTitleChange}
                    onDescriptionChange={handlers?.onDescriptionChange}
                    onImageChange={handlers?.onImagesChange ? (file) => handlers.onImagesChange!(0, file) : undefined}
                />
            );
        case ProgramSectionTemplate.SingleImageTop:
            return (
                <SingleImageTop
                    title={data.title}
                    description={data.description}
                    image={data.images?.[0]}
                    mode={mode}
                    onTitleChange={handlers?.onTitleChange}
                    onDescriptionChange={handlers?.onDescriptionChange}
                    onImageChange={handlers?.onImagesChange ? (file) => handlers.onImagesChange!(0, file) : undefined}
                />
            );
        case ProgramSectionTemplate.SingleImageRight:
            return (
                <SingleImageRight
                    title={data.title}
                    description={data.description}
                    image={data.images?.[0]}
                    mode={mode}
                    onTitleChange={handlers?.onTitleChange}
                    onDescriptionChange={handlers?.onDescriptionChange}
                    onImageChange={handlers?.onImagesChange ? (file) => handlers.onImagesChange!(0, file) : undefined}
                />
            );
        default:
            return null;
    }
};

export const getInitialSectionContents = (templateId: ProgramSectionTemplate): ProgramSectionContent[] => {
    const baseContents: ProgramSectionContent[] = [
        {
            contentType: ContentType.Title,
            order: 0,
            title: '',
            description: null,
            image: null,
        },
        {
            contentType: ContentType.Description,
            order: 1,
            title: null,
            description: '',
            image: null,
        },
    ];

    switch (templateId) {
        case ProgramSectionTemplate.TextOnly:
            return baseContents;

        case ProgramSectionTemplate.SingleImageTop:
        case ProgramSectionTemplate.SingleImageBottom:
        case ProgramSectionTemplate.SingleImageRight:
            return [
                ...baseContents,
                { contentType: ContentType.Image, order: 2, title: null, description: null, image: null },
            ];

        case ProgramSectionTemplate.DualImagesBottom:
            return [
                ...baseContents,
                { contentType: ContentType.Image, order: 2, title: null, description: null, image: null },
                { contentType: ContentType.Image, order: 3, title: null, description: null, image: null },
            ];

        case ProgramSectionTemplate.TripleImagesBottom:
            return [
                ...baseContents,
                { contentType: ContentType.Image, order: 2, title: null, description: null, image: null },
                { contentType: ContentType.Image, order: 3, title: null, description: null, image: null },
                { contentType: ContentType.Image, order: 4, title: null, description: null, image: null },
            ];

        case ProgramSectionTemplate.QuadImagesBottom:
            return [
                ...baseContents,
                { contentType: ContentType.Image, order: 2, title: null, description: null, image: null },
                { contentType: ContentType.Image, order: 3, title: null, description: null, image: null },
                { contentType: ContentType.Image, order: 4, title: null, description: null, image: null },
                { contentType: ContentType.Image, order: 5, title: null, description: null, image: null },
            ];

        default:
            return baseContents;
    }
};
