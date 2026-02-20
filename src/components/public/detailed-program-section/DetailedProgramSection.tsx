import React from 'react';
import { ProgramSection, ProgramSectionContent, ProgramSectionMode } from '@/types/common/program-sections';
import { ContentType } from '@/types/common/programs';
import { renderProgramSection } from '@/utils/functions/render-program-section';
import { getDescriptionAuthorPairsByGroup } from '@/utils/functions/mappers/public/program/get-grouped-program-section-content-pairs';
import styles from './DetailedProgramSection.module.scss';

export interface DetailedProgramSectionProps {
    section: ProgramSection;
}

const getContentByType = (contents: ProgramSectionContent[], type: ContentType): ProgramSectionContent | undefined => {
    return contents.find((c) => c.contentType === type);
};

export const DetailedProgramSection: React.FC<DetailedProgramSectionProps> = ({ section }) => {
    const titleContent = getContentByType(section.contents, ContentType.Title);
    const descriptionContent = getContentByType(section.contents, ContentType.Description);

    const descriptionAuthorPairs = getDescriptionAuthorPairsByGroup(section.contents).map((pair) => ({
        description: pair.description,
        author: pair.author,
    }));

    const imageContents = section.contents
        .filter((c) => c.contentType === ContentType.Image)
        .sort((a, b) => a.order - b.order)
        .map((c) => c.image || null);

    const renderedSection = renderProgramSection({
        templateId: section.template,
        data: {
            title: titleContent?.title || '',
            description: descriptionContent?.description || '',
            images: imageContents,
            descriptionAuthorPairs,
        },
        mode: ProgramSectionMode.Published,
    });

    return <div className={styles.container}>{renderedSection}</div>;
};
