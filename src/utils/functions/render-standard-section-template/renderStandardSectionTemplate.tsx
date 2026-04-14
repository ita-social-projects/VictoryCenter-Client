import React from 'react';
import { DualImagesBottom } from '@/components/common/section-templates/dual-images-bottom/DualImagesBottom';
import { QuadImagesBottom } from '@/components/common/section-templates/quad-images-bottom/QuadImagesBottom';
import { SingleImageBottom } from '@/components/common/section-templates/single-image-bottom/SingleImageBottom';
import { SingleImageRight } from '@/components/common/section-templates/single-image-right/SingleImageRight';
import { SingleImageTop } from '@/components/common/section-templates/single-image-top/SingleImageTop';
import { TextOnly } from '@/components/common/section-templates/text-only/TextOnly';
import { TripleImagesBottom } from '@/components/common/section-templates/triple-images-bottom/TripleImagesBottom';
import { Image, ImageValues } from '@/types/common/image';
import { SectionMode, SectionTemplate } from '@/types/common/sections';

export interface StandardSectionData {
    title?: string;
    description?: string;
    images?: (Image | ImageValues | null)[];
}

export interface StandardSectionHandlers {
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    onImagesChange?: (index: number, file: ImageValues | null) => void;
}

export interface StandardTemplateProps {
    title?: string;
    description?: string;
    mode?: SectionMode;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    validationResetKey?: number;
}

export type StandardTemplateComponentProps =
    | (StandardTemplateProps & {
          image?: Image | ImageValues | null;
          onImageChange?: (file: ImageValues | null) => void;
      })
    | (StandardTemplateProps & {
          images?: (Image | ImageValues | null)[];
          onImagesChange?: (index: number, file: ImageValues | null) => void;
      });

export type StandardTemplateComponentMap = Partial<
    Record<SectionTemplate, React.ComponentType<StandardTemplateComponentProps>>
>;

export const SINGLE_IMAGE_TEMPLATES = new Set<SectionTemplate>([
    SectionTemplate.SingleImageTop,
    SectionTemplate.SingleImageBottom,
    SectionTemplate.SingleImageRight,
]);

export const STANDARD_TEMPLATES_MAP: StandardTemplateComponentMap = {
    [SectionTemplate.TextOnly]: TextOnly,
    [SectionTemplate.SingleImageTop]: SingleImageTop,
    [SectionTemplate.SingleImageBottom]: SingleImageBottom,
    [SectionTemplate.SingleImageRight]: SingleImageRight,
    [SectionTemplate.DualImagesBottom]: DualImagesBottom,
    [SectionTemplate.TripleImagesBottom]: TripleImagesBottom,
    [SectionTemplate.QuadImagesBottom]: QuadImagesBottom,
};

export interface RenderStandardSectionTemplateParams {
    templateId: SectionTemplate;
    data: StandardSectionData;
    mode?: SectionMode;
    handlers?: StandardSectionHandlers;
    validationResetKey?: number;
    templatesMap?: StandardTemplateComponentMap;
}

export const renderStandardSectionTemplate = ({
    templateId,
    data,
    mode = SectionMode.View,
    handlers,
    validationResetKey,
    templatesMap = STANDARD_TEMPLATES_MAP,
}: RenderStandardSectionTemplateParams): React.ReactElement | null => {
    const Component = templatesMap[templateId];
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
