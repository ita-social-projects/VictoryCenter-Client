import type { CSSProperties } from 'react';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { HippotherapyPageLocalizationBlock, HippotherapyPageLocalizedContent } from '@/types/admin/hippotherapy-page';
import introDefaultImage from '@/assets/images/man-touching-white-horse-side.webp';
import quoteDefaultImage from '@/assets/images/man-holding-horse-cheek-close.webp';
import anotherQuoteDefaultImage from '@/assets/images/man-facing-horse-forehead.webp';
import hippoventionCenterDefaultImage from '@/assets/images/people-on-horses.webp';
import ethicsDefaultImage from '@/assets/images/ethic.webp';
import advantageDefaultImage0 from '@/assets/images/man-horse.webp';
import advantageDefaultImage1 from '@/assets/images/man-gray-horse.webp';
import advantageDefaultImage2 from '@/assets/images/collected.webp';
import advantageDefaultImage3 from '@/assets/images/man-leads-horse.webp';

export const HIPPOTHERAPY_PAGE_TEXT = {
    FAIL_TO_FETCH: 'Виникла помилка, не вдалось завантажити сторінку "Іпотерапія"',
    EMPTY_STATE_NOTICE:
        'Ця сторінка ще не має контенту. Заповніть поля нижче та натисніть "Опублікувати", щоб створити її.',
    MIN_TITLE_LENGTH: 5,
    MIN_TEXT_LENGTH: 10,
    MIN_REFERENCE_NAME_LENGTH: 5,
    MIN_REFERENCE_URL_LENGTH: 5,
    LABEL: {
        ADDITIONAL_DESCRIPTION: 'Додатковий опис',
        CITATION_NAME: 'Назва',
        CITATION_URL: 'Посилання',
    },

    BUTTON: {
        ADD_REFERENCE: 'Додати',
    },

    CONFIRMATION: {
        DELETE_REFERENCE: 'Видалити наукове дослідження?',
    },
};

export const HIPPOTHERAPY_PAGE_CHAR_LIMITS = {
    INTRO_TITLE: 50,
    INTRO_DESCRIPTION: 300,
    TEXT_CARD_TITLE: 50,
    TEXT_CARD_DESCRIPTION: 1000,
    QUOTE_TEXT: 300,
    QUOTE_AUTHOR: 50,
    HIPPOVENTION_CENTER_TITLE: 50,
    HIPPOVENTION_CENTER_PROS: 300,
    HIPPOVENTION_CENTER_DESCRIPTION: 50,
    GALLERY_TITLE: 50,
    GALLERY_CARD_DESCRIPTION: 300,
    RESEARCH_TITLE: 50,
    RESEARCH_DESCRIPTION: 300,
    RESEARCH_CITATION_NAME: 150,
    RESEARCH_CITATION_URL: 1000,
    ETHICS_TITLE: 50,
    ETHICS_DESCRIPTION: 300,
    ETHICS_PRINCIPLE: 300,
};

export interface HippotherapyTranslationFieldConfig {
    name: string;
    label: string;
    maxLength: number;
    minLength?: number;
    isRequired: boolean;
}

export interface HippotherapyTranslationSectionConfig {
    sectionKey: keyof HippotherapyPageLocalizedContent;
    fields: HippotherapyTranslationFieldConfig[];
}

const createIntroTranslationFields = (): HippotherapyTranslationFieldConfig[] => [
    {
        name: 'title',
        label: COMMON_TEXT_ADMIN.TYPE.TITLE,
        maxLength: HIPPOTHERAPY_PAGE_CHAR_LIMITS.INTRO_TITLE,
        minLength: HIPPOTHERAPY_PAGE_TEXT.MIN_TITLE_LENGTH,
        isRequired: true,
    },
    {
        name: 'description',
        label: COMMON_TEXT_ADMIN.TYPE.DESCRIPTION,
        maxLength: HIPPOTHERAPY_PAGE_CHAR_LIMITS.INTRO_DESCRIPTION,
        minLength: HIPPOTHERAPY_PAGE_TEXT.MIN_TEXT_LENGTH,
        isRequired: true,
    },
];

const createTextCardTranslationFields = (): HippotherapyTranslationFieldConfig[] => [
    {
        name: 'title',
        label: COMMON_TEXT_ADMIN.TYPE.TITLE,
        maxLength: HIPPOTHERAPY_PAGE_CHAR_LIMITS.TEXT_CARD_TITLE,
        minLength: HIPPOTHERAPY_PAGE_TEXT.MIN_TITLE_LENGTH,
        isRequired: true,
    },
    {
        name: 'description',
        label: COMMON_TEXT_ADMIN.TYPE.DESCRIPTION,
        maxLength: HIPPOTHERAPY_PAGE_CHAR_LIMITS.TEXT_CARD_DESCRIPTION,
        minLength: HIPPOTHERAPY_PAGE_TEXT.MIN_TEXT_LENGTH,
        isRequired: true,
    },
];

const createQuoteTranslationFields = (): HippotherapyTranslationFieldConfig[] => [
    {
        name: 'quoteText',
        label: COMMON_TEXT_ADMIN.TYPE.DESCRIPTION,
        maxLength: HIPPOTHERAPY_PAGE_CHAR_LIMITS.QUOTE_TEXT,
        minLength: HIPPOTHERAPY_PAGE_TEXT.MIN_TEXT_LENGTH,
        isRequired: true,
    },
    {
        name: 'authorName',
        label: HIPPOTHERAPY_PAGE_TEXT.LABEL.ADDITIONAL_DESCRIPTION,
        maxLength: HIPPOTHERAPY_PAGE_CHAR_LIMITS.QUOTE_AUTHOR,
        minLength: HIPPOTHERAPY_PAGE_TEXT.MIN_TEXT_LENGTH,
        isRequired: false,
    },
];

export const HIPPOTHERAPY_TRANSLATION_SECTIONS: Partial<
    Record<HippotherapyPageLocalizationBlock, HippotherapyTranslationSectionConfig>
> = {
    [HippotherapyPageLocalizationBlock.Intro]: {
        sectionKey: 'introSection',
        fields: createIntroTranslationFields(),
    },
    [HippotherapyPageLocalizationBlock.Description]: {
        sectionKey: 'descriptionSection',
        fields: createTextCardTranslationFields(),
    },
    [HippotherapyPageLocalizationBlock.Quote]: {
        sectionKey: 'quoteSection',
        fields: createQuoteTranslationFields(),
    },
    [HippotherapyPageLocalizationBlock.Hippovention]: {
        sectionKey: 'hippoventionSection',
        fields: createTextCardTranslationFields(),
    },
    [HippotherapyPageLocalizationBlock.Analysis]: {
        sectionKey: 'analysisSection',
        fields: createTextCardTranslationFields(),
    },
    [HippotherapyPageLocalizationBlock.AnotherQuote]: {
        sectionKey: 'anotherQuoteSection',
        fields: createQuoteTranslationFields(),
    },
};

export interface HippotherapyImageConfig {
    cropWidth: number;
    cropHeight: number;
    minWidth: number;
    minHeight: number;
}

export const HIPPOTHERAPY_PAGE_IMAGE_CONFIGS: Record<string, HippotherapyImageConfig> = {
    INTRO: { cropWidth: 1440, cropHeight: 800, minWidth: 1440, minHeight: 800 },
    QUOTE: { cropWidth: 1440, cropHeight: 420, minWidth: 1440, minHeight: 420 },
    HIPPOVENTION_CENTER: { cropWidth: 1400, cropHeight: 800, minWidth: 1400, minHeight: 800 },
    GALLERY_CARD: { cropWidth: 360, cropHeight: 430, minWidth: 360, minHeight: 430 },
    ETHICS: { cropWidth: 1440, cropHeight: 420, minWidth: 1440, minHeight: 420 },
};

const createGradientBackgroundStyle = (imageUrl: string): CSSProperties => ({
    backgroundImage: `linear-gradient(rgba(245, 245, 245, 0.85), rgba(245, 245, 245, 0.85)), url(${imageUrl})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
});

const createDefaultImageStyle = (imageUrl: string, displayWidth: number, displayHeight: number): CSSProperties => ({
    width: `${displayWidth}px`,
    height: `${displayHeight}px`,
    ...createGradientBackgroundStyle(imageUrl),
});

const createBannerImageStyle = (imageUrl: string, config: HippotherapyImageConfig): CSSProperties => ({
    width: '100%',
    aspectRatio: `${config.cropWidth} / ${config.cropHeight}`,
    ...createGradientBackgroundStyle(imageUrl),
});

const createOverlayImageStyle = (imageUrl: string): CSSProperties => ({
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    ...createGradientBackgroundStyle(imageUrl),
});

const createCardImageStyle = (imageUrl: string): CSSProperties => ({
    width: '100%',
    height: '100%',
    ...createGradientBackgroundStyle(imageUrl),
});

const defaultGalleryCardStyles = [
    advantageDefaultImage0,
    advantageDefaultImage1,
    advantageDefaultImage2,
    advantageDefaultImage3,
].map(createCardImageStyle);

export const HIPPOTHERAPY_PAGE_DEFAULT_IMAGE_STYLES = {
    INTRO: createDefaultImageStyle(introDefaultImage, 850, 472),
    QUOTE: createBannerImageStyle(quoteDefaultImage, HIPPOTHERAPY_PAGE_IMAGE_CONFIGS.QUOTE),
    ANOTHER_QUOTE: createBannerImageStyle(anotherQuoteDefaultImage, HIPPOTHERAPY_PAGE_IMAGE_CONFIGS.QUOTE),
    HIPPOVENTION_CENTER: createOverlayImageStyle(hippoventionCenterDefaultImage),
    ETHICS: createOverlayImageStyle(ethicsDefaultImage),
    ADVANTAGES_CARDS: defaultGalleryCardStyles,
    PARTICIPANTS_CARDS: defaultGalleryCardStyles,
};
