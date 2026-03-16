import React from 'react';
import {
    HippotherapyProgramSectionDto,
    HippotherapyProgramSectionContentDto,
    ProgramSectionMode,
} from '@/types/common/program-sections';
import { ContentType } from '@/types/common/programs';
import { useLocale } from '@/hooks/common/use-locale/useLocale';
import { renderProgramSection } from '@/utils/functions/render-program-section';
import { getDescriptionAuthorPairsByGroup } from '@/utils/functions/mappers/public/program/get-grouped-program-section-content-pairs';
import { mapLocalizationDtoToModel } from '@/utils/functions/mappers/common/localization/localization-mappers';
import styles from './DetailedProgramSection.module.scss';

export interface DetailedProgramSectionProps {
    section: HippotherapyProgramSectionDto;
}

const getContentByType = (
    contents: HippotherapyProgramSectionContentDto[],
    type: ContentType,
): HippotherapyProgramSectionContentDto | undefined => {
    return contents.find((c) => c.contentType === type);
};

const getDescriptionsInOrder = (contents: HippotherapyProgramSectionContentDto[]) => {
    return contents.filter((c) => c.contentType === ContentType.Description).sort((a, b) => a.order - b.order);
};

const localizeContent = (
    content: HippotherapyProgramSectionContentDto,
    currentLanguage: string,
): HippotherapyProgramSectionContentDto => {
    const contentLocalization = (content.localizations ?? [])
        .map((item) => mapLocalizationDtoToModel(item))
        .find((item) => item.language.code === currentLanguage);

    const faqLocalization = content.faqQuestion?.localizations?.find((loc) => loc.language.code === currentLanguage);

    const {
        language: _language1,
        translationStatus: _translationStatus1,
        entityId: _entityId,
        ...localizedFields
    } = contentLocalization ?? {};
    const {
        language: _language2,
        translationStatus: _translationStatus2,
        ...localizedFaqFields
    } = faqLocalization ?? {};

    return {
        ...content,
        ...localizedFields,
        faqQuestion: content.faqQuestion
            ? {
                  ...content.faqQuestion,
                  ...localizedFaqFields,
              }
            : null,
    };
};

export const DetailedProgramSection: React.FC<DetailedProgramSectionProps> = ({ section }) => {
    const { currentLanguage } = useLocale();

    const localizedContents = section.contents.map((content) => localizeContent(content, currentLanguage));

    const titleContent = getContentByType(localizedContents, ContentType.Title);
    const descriptionContent = getContentByType(localizedContents, ContentType.Description);

    const descriptionAuthorPairs = getDescriptionAuthorPairsByGroup(localizedContents).map((pair) => ({
        description: pair.description,
        author: pair.author,
    }));

    const orderedTitleContents = localizedContents
        .filter((c) => c.contentType === ContentType.Title)
        .sort((a, b) => a.order - b.order);

    const orderedDescriptionContents = getDescriptionsInOrder(localizedContents);

    const imageContents = localizedContents
        .filter((c) => c.contentType === ContentType.Image)
        .sort((a, b) => a.order - b.order)
        .map((c) => c.image || null);

    const cards = orderedTitleContents.map((t, i) => ({
        title: t.title || '',
        description: orderedDescriptionContents[i]?.description || '',
    }));

    const descriptions = orderedDescriptionContents.map((d) => d.description || '');

    const faqQuestions = localizedContents
        .filter((c) => c.contentType === ContentType.FaqQuestion && c.faqQuestion != null)
        .sort((a, b) => a.order - b.order)
        .map((c) => c.faqQuestion!);

    const renderedSection = renderProgramSection({
        templateId: section.template,
        data: {
            title: titleContent?.title || '',
            description: descriptionContent?.description || '',
            descriptions,
            images: imageContents,
            cards,
            descriptionAuthorPairs,
            faqQuestions,
        },
        mode: ProgramSectionMode.View,
    });

    return <div className={styles.container}>{renderedSection}</div>;
};
