import React from 'react';
import { HistorySectionContentDto } from '@/types/common/history-sections';
import { SectionTemplate, SectionMode } from '@/types/common/sections';
import { ContentType } from '@/types/common/section-contents';
import {
    renderStandardSectionTemplate,
    StandardSectionData,
    StandardSectionHandlers,
} from '@/utils/functions/render-standard-section-template';

export interface HistorySectionData extends StandardSectionData {}

export interface HistorySectionHandlers extends StandardSectionHandlers {}

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

    return renderStandardSectionTemplate({
        templateId,
        data,
        mode,
        handlers,
        validationResetKey,
    });
};
