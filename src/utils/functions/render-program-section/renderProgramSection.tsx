import React from 'react';
import { ProgramSectionTemplate } from '@/types/common/program-sections';
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

export interface RenderProgramSectionParams {
    templateId: ProgramSectionTemplate;
    data: ProgramSectionData;
    isTemplate?: boolean;
}

export const renderProgramSection = ({
    templateId,
    data,
    isTemplate = false,
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
                />
            );
        case ProgramSectionTemplate.TextOnly:
            return <TextOnly title={data.title} description={data.description} isTemplate={isTemplate} />;
        case ProgramSectionTemplate.TripleImagesBottom:
            return (
                <TrippleImagesBottom
                    title={data.title}
                    description={data.description}
                    image1={data.image1}
                    image2={data.image2}
                    image3={data.image3}
                    isTemplate={isTemplate}
                />
            );
        case ProgramSectionTemplate.SingleImageBottom:
            return (
                <SingleImageBottom
                    title={data.title}
                    description={data.description}
                    image1={data.image1}
                    isTemplate={isTemplate}
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
