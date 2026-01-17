import React from 'react';
import { ProgramSectionTemplate } from '@/types/common/program-sections';
import { ProgramSectionContent, ContentType } from '@/types/admin/programs';
import { ImageValues } from '@/types/common/image';
import { QuadImagesBottom } from '@/components/common/program-section-templates/quad-images-bottom/QuadImagesBottom';
import { TripleImagesBottom } from '@/components/common/program-section-templates/triple-images-bottom/TripleImagesBottom';
import { DualImagesBottom } from '@/components/common/program-section-templates/dual-images-bottom/DualImagesBottom';
import { TextOnly } from '@/components/common/program-section-templates/text-only/TextOnly';
import { SingleImageTop } from '@/components/common/program-section-templates/single-image-top/SingleImageTop';
import { SingleImageBottom } from '@/components/common/program-section-templates/single-image-bottom/SingleImageBottom';
import { SingleImageRight } from '@/components/common/program-section-templates/single-image-right/SingleImageRight';
import { DualTitleDescription } from '@/components/common/program-section-templates/dual-title-description/DualTitleDescription';
import { QuadTitleDescription } from '@/components/common/program-section-templates/quad-title-description/QuadTitleDescription';
import { TripleTitleDescription } from '@/components/common/program-section-templates/triple-title-description/TripleTitleDescription';

export interface ProgramSectionCardData {
    title: string;
    description: string;
}

export interface ProgramSectionData {
    title?: string;
    description?: string;
    images?: string[];
    cards?: ProgramSectionCardData[];
}

export interface ProgramSectionHandlers {
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    onImagesChange?: (index: number, file: ImageValues | null) => void;
    onCardTitleChange?: (index: number, value: string) => void;
    onCardDescriptionChange?: (index: number, value: string) => void;
}

export interface RenderProgramSectionParams {
    templateId: ProgramSectionTemplate;
    data: ProgramSectionData;
    isTemplate?: boolean;
    isEditable?: boolean;
    handlers?: ProgramSectionHandlers;
}

export const renderProgramSection = ({
    templateId,
    data,
    isTemplate = false,
    isEditable = false,
    handlers,
}: RenderProgramSectionParams): React.ReactElement | null => {
    switch (templateId) {
        case ProgramSectionTemplate.QuadImagesBottom:
            return (
                <QuadImagesBottom
                    title={data.title}
                    description={data.description}
                    images={data.images}
                    isTemplate={isTemplate}
                    isEditable={isEditable}
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
                    isTemplate={isTemplate}
                    isEditable={isEditable}
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
                    isTemplate={isTemplate}
                    isEditable={isEditable}
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
                    isTemplate={isTemplate}
                    isEditable={isEditable}
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
                    isTemplate={isTemplate}
                    isEditable={isEditable}
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
                    isTemplate={isTemplate}
                    isEditable={isEditable}
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
                    isTemplate={isTemplate}
                    isEditable={isEditable}
                    onTitleChange={handlers?.onTitleChange}
                    onDescriptionChange={handlers?.onDescriptionChange}
                    onImageChange={handlers?.onImagesChange ? (file) => handlers.onImagesChange!(0, file) : undefined}
                />
            );
        case ProgramSectionTemplate.DualTitleDescription:
            return (
                <DualTitleDescription
                    cards={data.cards ?? []}
                    isTemplate={isTemplate}
                    isEditable={isEditable}
                    onTitleChange={handlers?.onCardTitleChange}
                    onDescriptionChange={handlers?.onCardDescriptionChange}
                />
            );
        case ProgramSectionTemplate.TripleTitleDescription:
            return (
                <TripleTitleDescription
                    cards={data.cards ?? []}
                    isTemplate={isTemplate}
                    isEditable={isEditable}
                    onTitleChange={handlers?.onCardTitleChange}
                    onDescriptionChange={handlers?.onCardDescriptionChange}
                />
            );
        case ProgramSectionTemplate.QuadTitleDescription:
            return (
                <QuadTitleDescription
                    cards={data.cards ?? []}
                    isTemplate={isTemplate}
                    isEditable={isEditable}
                    onTitleChange={handlers?.onCardTitleChange}
                    onDescriptionChange={handlers?.onCardDescriptionChange}
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

        case ProgramSectionTemplate.DualTitleDescription:
            return [
                { contentType: ContentType.Title, order: 0, title: '', description: null, image: null },
                { contentType: ContentType.Description, order: 1, title: null, description: '', image: null },

                { contentType: ContentType.Title, order: 2, title: '', description: null, image: null },
                { contentType: ContentType.Description, order: 3, title: null, description: '', image: null },
            ];

        case ProgramSectionTemplate.TripleTitleDescription:
            return [
                { contentType: ContentType.Title, order: 0, title: '', description: null, image: null },
                { contentType: ContentType.Description, order: 1, title: null, description: '', image: null },

                { contentType: ContentType.Title, order: 2, title: '', description: null, image: null },
                { contentType: ContentType.Description, order: 3, title: null, description: '', image: null },

                { contentType: ContentType.Title, order: 4, title: '', description: null, image: null },
                { contentType: ContentType.Description, order: 5, title: null, description: '', image: null },
            ];

        case ProgramSectionTemplate.QuadTitleDescription:
            return [
                { contentType: ContentType.Title, order: 0, title: '', description: null, image: null },
                { contentType: ContentType.Description, order: 1, title: null, description: '', image: null },

                { contentType: ContentType.Title, order: 2, title: '', description: null, image: null },
                { contentType: ContentType.Description, order: 3, title: null, description: '', image: null },

                { contentType: ContentType.Title, order: 4, title: '', description: null, image: null },
                { contentType: ContentType.Description, order: 5, title: null, description: '', image: null },

                { contentType: ContentType.Title, order: 6, title: '', description: null, image: null },
                { contentType: ContentType.Description, order: 7, title: null, description: '', image: null },
            ];

        default:
            return baseContents;
    }
};
