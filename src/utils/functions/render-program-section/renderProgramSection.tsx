import React from 'react';
import { ProgramSectionTemplate } from '@/types/common/program-sections';
import { ProgramSectionContent, ContentType } from '@/types/admin/programs';
import { ImageValues } from '@/types/common/image';
import { QuadImagesBottom } from '@/components/common/program-section-templates/quad-images-bottom/QuadImagesBottom';
import { TrippleImagesBottom } from '@/components/common/program-section-templates/tripple-images-bottom/TrippleImagesBottom';
import { DualImagesBottom } from '@/components/common/program-section-templates/dual-images-bottom/DualImagesBottom';
import { TextOnly } from '@/components/common/program-section-templates/text-only/TextOnly';
import { SingleImageTop } from '@/components/common/program-section-templates/single-image-top/SingleImageTop';
import { SingleImageBottom } from '@/components/common/program-section-templates/single-image-bottom/SingleImageBottom';
import { SingleImageRight } from '@/components/common/program-section-templates/single-image-right/SingleImageRight';

export interface ProgramSectionData {
    title?: string;
    description?: string;
    image1?: string;
    image2?: string;
    image3?: string;
    image4?: string;
}

export interface ProgramSectionHandlers {
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    onImage1Change?: (file: ImageValues | null) => void;
    onImage2Change?: (file: ImageValues | null) => void;
    onImage3Change?: (file: ImageValues | null) => void;
    onImage4Change?: (file: ImageValues | null) => void;
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
                    image1={data.image1}
                    image2={data.image2}
                    image3={data.image3}
                    image4={data.image4}
                    isTemplate={isTemplate}
                    isEditable={isEditable}
                    onTitleChange={handlers?.onTitleChange}
                    onDescriptionChange={handlers?.onDescriptionChange}
                    onImage1Change={handlers?.onImage1Change}
                    onImage2Change={handlers?.onImage2Change}
                    onImage3Change={handlers?.onImage3Change}
                    onImage4Change={handlers?.onImage4Change}
                />
            );
        case ProgramSectionTemplate.DualImagesBottom:
            return (
                <DualImagesBottom
                    title={data.title}
                    description={data.description}
                    image1={data.image1}
                    image2={data.image2}
                    isTemplate={isTemplate}
                    isEditable={isEditable}
                    onTitleChange={handlers?.onTitleChange}
                    onDescriptionChange={handlers?.onDescriptionChange}
                    onImage1Change={handlers?.onImage1Change}
                    onImage2Change={handlers?.onImage2Change}
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
                <TrippleImagesBottom
                    title={data.title}
                    description={data.description}
                    image1={data.image1}
                    image2={data.image2}
                    image3={data.image3}
                    isTemplate={isTemplate}
                    isEditable={isEditable}
                    onTitleChange={handlers?.onTitleChange}
                    onDescriptionChange={handlers?.onDescriptionChange}
                    onImage1Change={handlers?.onImage1Change}
                    onImage2Change={handlers?.onImage2Change}
                    onImage3Change={handlers?.onImage3Change}
                />
            );
        case ProgramSectionTemplate.SingleImageBottom:
            return (
                <SingleImageBottom
                    title={data.title}
                    description={data.description}
                    image1={data.image1}
                    isTemplate={isTemplate}
                    isEditable={isEditable}
                    onTitleChange={handlers?.onTitleChange}
                    onDescriptionChange={handlers?.onDescriptionChange}
                    onImage1Change={handlers?.onImage1Change}
                />
            );
        case ProgramSectionTemplate.SingleImageTop:
            return (
                <SingleImageTop
                    title={data.title}
                    description={data.description}
                    image1={data.image1}
                    isTemplate={isTemplate}
                />
            );
        case ProgramSectionTemplate.SingleImageRight:
            return (
                <SingleImageRight
                    title={data.title}
                    description={data.description}
                    image1={data.image1}
                    isTemplate={isTemplate}
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
