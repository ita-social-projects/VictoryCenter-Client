import React from 'react';
import { HistorySectionContentDto } from '@/types/common/history-sections';
import { SectionTemplate, SectionMode } from '@/types/common/sections';
import { ImageValues, Image } from '@/types/common/image';
import { ContentType } from '@/types/common/section-contents';
import { QuadImagesBottom } from '@/components/common/section-templates/quad-images-bottom/QuadImagesBottom';
import { TripleImagesBottom } from '@/components/common/section-templates/triple-images-bottom/TripleImagesBottom';
import { DualImagesBottom } from '@/components/common/section-templates/dual-images-bottom/DualImagesBottom';
import { TextOnly } from '@/components/common/section-templates/text-only/TextOnly';
import { SingleImageTop } from '@/components/common/section-templates/single-image-top/SingleImageTop';
import { SingleImageBottom } from '@/components/common/section-templates/single-image-bottom/SingleImageBottom';
import { SingleImageRight } from '@/components/common/section-templates/single-image-right/SingleImageRight';

export interface HistorySectionData {
    title?: string;
    description?: string;
    images?: (Image | ImageValues | null)[];
}

export interface HistorySectionHandlers {
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    onImagesChange?: (index: number, file: ImageValues | null) => void;
}

export interface RenderHistorySectionParams {
    templateId: SectionTemplate;
    data: HistorySectionData;
    mode?: SectionMode;
    handlers?: HistorySectionHandlers;
    validationResetKey?: number;
}

export type HistorySectionTemplate =
    | SectionTemplate.QuadImagesBottom
    | SectionTemplate.DualImagesBottom
    | SectionTemplate.TextOnly
    | SectionTemplate.TripleImagesBottom
    | SectionTemplate.SingleImageBottom
    | SectionTemplate.SingleImageTop
    | SectionTemplate.SingleImageRight;

export const HISTORY_SUPPORTED_TEMPLATES: HistorySectionTemplate[] = [
    SectionTemplate.QuadImagesBottom,
    SectionTemplate.DualImagesBottom,
    SectionTemplate.TextOnly,
    SectionTemplate.TripleImagesBottom,
    SectionTemplate.SingleImageBottom,
    SectionTemplate.SingleImageTop,
    SectionTemplate.SingleImageRight,
];

export const isHistoryTemplate = (templateId: SectionTemplate): templateId is HistorySectionTemplate =>
    HISTORY_SUPPORTED_TEMPLATES.includes(templateId as HistorySectionTemplate);

const createItem = (
    type: ContentType,
    order: number,
    overrides: Partial<HistorySectionContentDto> = {},
): HistorySectionContentDto => ({
    contentType: type,
    order,
    title: type === ContentType.Title ? '' : null,
    description: type === ContentType.Description ? '' : null,
    image: null,
    ...overrides,
});

const createBaseContents = (): HistorySectionContentDto[] => [
    createItem(ContentType.Title, 0),
    createItem(ContentType.Description, 1),
];

const createImageContents = (count: number): HistorySectionContentDto[] =>
    Array.from({ length: count }, (_, i) => createItem(ContentType.Image, 2 + i));

const IMAGE_COUNT_MAP: Record<HistorySectionTemplate, number> = {
    [SectionTemplate.TextOnly]: 0,
    [SectionTemplate.SingleImageTop]: 1,
    [SectionTemplate.SingleImageBottom]: 1,
    [SectionTemplate.SingleImageRight]: 1,
    [SectionTemplate.DualImagesBottom]: 2,
    [SectionTemplate.TripleImagesBottom]: 3,
    [SectionTemplate.QuadImagesBottom]: 4,
};

const SINGLE_IMAGE_TEMPLATES = new Set<HistorySectionTemplate>([
    SectionTemplate.SingleImageTop,
    SectionTemplate.SingleImageBottom,
    SectionTemplate.SingleImageRight,
]);

interface StandardTemplateProps {
    title?: string;
    description?: string;
    mode?: SectionMode;
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

const STANDARD_TEMPLATES_MAP: Record<HistorySectionTemplate, React.ComponentType<StandardTemplateComponentProps>> = {
    [SectionTemplate.TextOnly]: TextOnly,
    [SectionTemplate.SingleImageTop]: SingleImageTop,
    [SectionTemplate.SingleImageBottom]: SingleImageBottom,
    [SectionTemplate.SingleImageRight]: SingleImageRight,
    [SectionTemplate.DualImagesBottom]: DualImagesBottom,
    [SectionTemplate.TripleImagesBottom]: TripleImagesBottom,
    [SectionTemplate.QuadImagesBottom]: QuadImagesBottom,
};

export const getInitialHistorySectionContents = (templateId: SectionTemplate): HistorySectionContentDto[] => {
    if (!isHistoryTemplate(templateId)) {
        return [];
    }

    const imageCount = IMAGE_COUNT_MAP[templateId];
    return [...createBaseContents(), ...createImageContents(imageCount)];
};

export const renderHistorySection = ({
    templateId,
    data,
    mode = SectionMode.View,
    handlers,
    validationResetKey,
}: RenderHistorySectionParams): React.ReactElement | null => {
    if (!isHistoryTemplate(templateId)) {
        return null;
    }

    const Component = STANDARD_TEMPLATES_MAP[templateId];

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
