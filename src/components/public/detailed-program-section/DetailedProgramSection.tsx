import React from 'react';
import {
    HippotherapyProgramSectionDto,
    HippotherapyProgramSectionContentDto,
    HippotherapyProgramSectionContentLocalization,
    HippotherapyProgramSectionContentLocalizationDto,
    ProgramSectionContentLocalizableFields,
} from '@/types/common/program-sections';
import { SectionMode } from '@/types/common/sections';
import { ContentType } from '@/types/common/section-contents';
import { FaqLocalization, FaqLocalizationDto } from '@/types/admin/faq';
import { EntityLocalization, EntityLocalizationDto } from '@/types/common/language';
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

type LocalizationFields = Pick<ProgramSectionContentLocalizableFields, 'title' | 'description' | 'author'> &
    ProgramSectionContentLocalizableFields & {
        question?: string | null;
        answer?: string | null;
    };

type SupportedLocalization =
    | (HippotherapyProgramSectionContentLocalization & ProgramSectionContentLocalizableFields)
    | (HippotherapyProgramSectionContentLocalizationDto & ProgramSectionContentLocalizableFields)
    | (FaqLocalization & ProgramSectionContentLocalizableFields)
    | (FaqLocalizationDto & ProgramSectionContentLocalizableFields);

const hasLanguage = (localization: EntityLocalization | EntityLocalizationDto): localization is EntityLocalization => {
    return 'language' in localization;
};

const getLanguageCode = (localization?: SupportedLocalization | null): string | undefined => {
    if (!localization) return undefined;

    return hasLanguage(localization) ? localization.language.code : localization.localizationInfoDto.code;
};

const getLocalizedText = (
    fields: LocalizationFields,
    key: 'questionText' | 'answerText',
    alias: 'question' | 'answer',
): string | undefined => {
    const direct = fields[key];
    if (typeof direct === 'string') return direct;

    const aliasValue = fields[alias];
    return typeof aliasValue === 'string' ? aliasValue : undefined;
};

const extractLocalizationFields = (localization?: SupportedLocalization | null): LocalizationFields => {
    if (!localization) {
        return {};
    }

    if (hasLanguage(localization)) {
        const { language: _lang, translationStatus: _status, ...fields } = localization;

        return fields;
    }

    const { localizationInfoDto: _langDto, translationStatus: _status, entityId: _entity, ...fields } = localization;

    return fields;
};

const getContentLocalizationFields = (content: HippotherapyProgramSectionContentDto, currentLanguage: string) => {
    const contentLocalization = (content.localizations ?? [])
        .map((item) => mapLocalizationDtoToModel(item))
        .find((item) => item.language.code === currentLanguage);

    return extractLocalizationFields(contentLocalization);
};

const getFaqLocalizationFields = (content: HippotherapyProgramSectionContentDto, currentLanguage: string) => {
    const faqLocalization = content.faqQuestion?.localizations?.find((loc) => getLanguageCode(loc) === currentLanguage);

    return extractLocalizationFields(faqLocalization);
};

const localizeContent = (
    content: HippotherapyProgramSectionContentDto,
    currentLanguage: string,
): HippotherapyProgramSectionContentDto => {
    const localizedFields = getContentLocalizationFields(content, currentLanguage);
    const localizedFaqFields = getFaqLocalizationFields(content, currentLanguage);

    const {
        questionText: _qText,
        answerText: _aText,
        question: _q,
        answer: _a,
        ...localizedFaqMetaFields
    } = localizedFaqFields;

    const localizedQuestion =
        getLocalizedText(localizedFaqFields, 'questionText', 'question') ||
        getLocalizedText(localizedFields, 'questionText', 'question');
    const localizedAnswer =
        getLocalizedText(localizedFaqFields, 'answerText', 'answer') ||
        getLocalizedText(localizedFields, 'answerText', 'answer');

    return {
        ...content,
        ...localizedFields,
        faqQuestion: content.faqQuestion
            ? {
                  ...content.faqQuestion,
                  ...localizedFaqMetaFields,
                  questionText: localizedQuestion ?? content.faqQuestion.questionText,
                  answerText: localizedAnswer ?? content.faqQuestion.answerText,
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
        mode: SectionMode.View,
    });

    return <div className={styles.container}>{renderedSection}</div>;
};
