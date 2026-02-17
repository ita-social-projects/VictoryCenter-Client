import React from 'react';
import { ProgramSection, ProgramSectionContent, ProgramSectionMode } from '@/types/common/program-sections';
import { ContentType } from '@/types/common/programs';
import { renderProgramSection } from '@/utils/functions/render-program-section';
import styles from './DetailedProgramSection.module.scss';

export interface DetailedProgramSectionProps {
    section: ProgramSection;
}

const getContentByType = (contents: ProgramSectionContent[], type: ContentType): ProgramSectionContent | undefined => {
    return contents.find((c) => c.contentType === type);
};

const getDescriptionsInOrder = (contents: ProgramSectionContent[]) => {
    return contents.filter((c) => c.contentType === ContentType.Description).sort((a, b) => a.order - b.order);
};

const getDescriptionAuthorPairs = (contents: ProgramSectionContent[]) => {
    const map = new Map<number, { description: string; author: string }>();

    for (const c of contents) {
        if (c.groupIndex === null || c.groupIndex === undefined) continue;

        const groupIndex = c.groupIndex;

        if (!map.has(groupIndex)) {
            map.set(groupIndex, { description: '', author: '' });
        }

        const entry = map.get(groupIndex)!;

        if (c.contentType === ContentType.Description) {
            entry.description = c.description || '';
        }

        if (c.contentType === ContentType.Author) {
            entry.author = c.author || '';
        }
    }

    return Array.from(map.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([, v]) => ({
            description: v.description,
            author: v.author,
        }));
};

export const DetailedProgramSection: React.FC<DetailedProgramSectionProps> = ({ section }) => {
    const titleContent = getContentByType(section.contents, ContentType.Title);

    const orderedTitleContents = section.contents
        .filter((c) => c.contentType === ContentType.Title)
        .sort((a, b) => a.order - b.order);

    const orderedDescriptionContents = getDescriptionsInOrder(section.contents);

    const descriptions = orderedDescriptionContents.map((c) => c.description || '');

    const imageContents = section.contents
        .filter((c) => c.contentType === ContentType.Image)
        .sort((a, b) => a.order - b.order)
        .map((c) => c.image || null);

    const cards = orderedTitleContents.map((t, i) => ({
        title: t.title || '',
        description: orderedDescriptionContents[i]?.description || '',
    }));

    const descriptionAuthorPairs = getDescriptionAuthorPairs(section.contents);

    const renderedSection = renderProgramSection({
        templateId: section.template,
        data: {
            title: titleContent?.title || '',
            description: descriptions[0] || '',
            descriptions,
            images: imageContents,
            cards,
            descriptionAuthorPairs,
        },
        mode: ProgramSectionMode.View,
    });

    return <div className={styles.container}>{renderedSection}</div>;
};
