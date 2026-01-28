import React from 'react';
import { ProgramSectionContent, ProgramSectionTemplate, ProgramSectionMode } from '@/types/common/program-sections';
import { ImageValues, Image } from '@/types/common/image';
import { QuadImagesBottom } from '@/components/common/program-section-templates/quad-images-bottom/QuadImagesBottom';
import { TripleImagesBottom } from '@/components/common/program-section-templates/triple-images-bottom/TripleImagesBottom';
import { DualImagesBottom } from '@/components/common/program-section-templates/dual-images-bottom/DualImagesBottom';
import { TextOnly } from '@/components/common/program-section-templates/text-only/TextOnly';
import { SingleImageTop } from '@/components/common/program-section-templates/single-image-top/SingleImageTop';
import { SingleImageBottom } from '@/components/common/program-section-templates/single-image-bottom/SingleImageBottom';
import { SingleImageRight } from '@/components/common/program-section-templates/single-image-right/SingleImageRight';
import { ContentType } from '@/types/common/programs';

export interface ProgramSectionData {
    title?: string;
    description?: string;
    images?: (Image | ImageValues | null)[];
}

export interface ProgramSectionHandlers {
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    onImagesChange?: (index: number, file: ImageValues | null) => void;
}

export interface RenderProgramSectionParams {
    templateId: ProgramSectionTemplate;
    data: ProgramSectionData;
    mode?: ProgramSectionMode;
    handlers?: ProgramSectionHandlers;
}

export const renderProgramSection = ({
    templateId,
    data,
    mode = ProgramSectionMode.Published,
    handlers,
}: RenderProgramSectionParams): React.ReactElement | null => {
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
