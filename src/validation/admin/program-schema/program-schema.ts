import { PROGRAM_VALIDATION, PROGRAM_SECTION_VALIDATION } from '@/const/admin/programs';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { ProgramCategory } from '@/types/admin/programs';
import { Image, ImageValues } from '@/types/common/image';
import { ProgramSection, ProgramSectionTemplate } from '@/types/common/program-sections';
import { ContentType } from '@/types/common/programs';
import * as Yup from 'yup';

export interface ProgramValidationContext {
    isPublishing: boolean;
}

export const programValidationSchema = Yup.object({
    name: Yup.string()
        .required(PROGRAM_VALIDATION.name.getRequiredError())
        .min(PROGRAM_VALIDATION.name.min, COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(PROGRAM_VALIDATION.name.min))
        .max(
            PROGRAM_VALIDATION.name.max,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(PROGRAM_VALIDATION.name.max),
        ),

    categories: Yup.array<ProgramCategory>()
        .of(
            Yup.object({
                id: Yup.number().required(),
                name: Yup.string().required(),
                programsCount: Yup.number().required(),
            }),
        )
        .required(PROGRAM_VALIDATION.categories.getAtLeastOneRequiredError())
        .min(1, PROGRAM_VALIDATION.categories.getAtLeastOneRequiredError()),

    description: Yup.string()
        .max(
            PROGRAM_VALIDATION.description.max,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(PROGRAM_VALIDATION.description.max),
        )
        .when('$isPublishing', ([isPublishing], schema) =>
            isPublishing
                ? schema
                      .required(PROGRAM_VALIDATION.description.getRequiredWhenPublishingError())
                      .min(
                          PROGRAM_VALIDATION.description.min,
                          COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(PROGRAM_VALIDATION.description.min),
                      )
                : schema.notRequired(),
        ),

    previewImage: Yup.mixed<Image | ImageValues>()
        .nullable()
        .default(null)
        .when('$isPublishing', ([isPublishing], schema) =>
            isPublishing
                ? schema.required(PROGRAM_VALIDATION.previewImage.getRequiredWhenPublishingError())
                : schema.notRequired(),
        )
        .transform((value) => {
            if (value === undefined || value === '') return null;
            return value;
        }),

    backgroundImage: Yup.mixed<Image | ImageValues>()
        .nullable()
        .default(null)
        .when('$isPublishing', ([isPublishing], schema) =>
            isPublishing
                ? schema.required(PROGRAM_VALIDATION.backgroundImage.getRequiredWhenPublishingError())
                : schema.notRequired(),
        )
        .transform((value) => {
            if (value === undefined || value === '') return null;
            return value;
        }),

    location: Yup.string()
        .max(
            PROGRAM_VALIDATION.location.max,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(PROGRAM_VALIDATION.location.max),
        )
        .notRequired(),

    participantsCount: Yup.string()
        .max(
            PROGRAM_VALIDATION.participantsCount.max,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(PROGRAM_VALIDATION.participantsCount.max),
        )
        .notRequired(),

    meetingsCount: Yup.string()
        .max(
            PROGRAM_VALIDATION.meetingCount.max,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(PROGRAM_VALIDATION.meetingCount.max),
        )
        .notRequired(),
});

export const PROGRAM_VALIDATION_FUNCTIONS = {
    validateName: (value: string, isPublishing: boolean): string | undefined => {
        const context: ProgramValidationContext = { isPublishing };
        try {
            programValidationSchema.validateSyncAt('name', { name: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateCategories: (value: ProgramCategory[], isPublishing: boolean): string | undefined => {
        const context: ProgramValidationContext = { isPublishing };
        try {
            programValidationSchema.validateSyncAt('categories', { categories: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateDescription: (value: string, isPublishing: boolean): string | undefined => {
        const context: ProgramValidationContext = { isPublishing };
        try {
            programValidationSchema.validateSyncAt('description', { description: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validatePreviewImage: (value: Image | ImageValues | null, isPublishing: boolean): string | undefined => {
        const context: ProgramValidationContext = { isPublishing };
        try {
            programValidationSchema.validateSyncAt('previewImage', { previewImage: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateBackgroundImage: (value: Image | ImageValues | null, isPublishing: boolean): string | undefined => {
        const context: ProgramValidationContext = { isPublishing };
        try {
            programValidationSchema.validateSyncAt('backgroundImage', { backgroundImage: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateLocation: (value: string, isPublishing: boolean): string | undefined => {
        const context: ProgramValidationContext = { isPublishing };
        try {
            programValidationSchema.validateSyncAt('location', { location: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateParticipantsCount: (value: string, isPublishing: boolean): string | undefined => {
        const context: ProgramValidationContext = { isPublishing };
        try {
            programValidationSchema.validateSyncAt('participantsCount', { participantsCount: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateMeetingCount: (value: string, isPublishing: boolean): string | undefined => {
        const context: ProgramValidationContext = { isPublishing };
        try {
            programValidationSchema.validateSyncAt('meetingsCount', { meetingsCount: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateSections: (sections: ProgramSection[], isPublishing: boolean): string | undefined => {
        const result = validateProgramSections(sections, isPublishing);
        return result;
    },
};

export const programSectionValidationSchema = Yup.object({
    sectionTitle: Yup.string()
        .trim()
        .required(PROGRAM_SECTION_VALIDATION.title.getRequiredError())
        .when('$isPublishing', ([isPublishing], schema) =>
            isPublishing
                ? schema
                      .min(
                          PROGRAM_SECTION_VALIDATION.title.min,
                          COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(PROGRAM_SECTION_VALIDATION.title.min),
                      )
                      .max(
                          PROGRAM_SECTION_VALIDATION.title.max,
                          COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(PROGRAM_SECTION_VALIDATION.title.max),
                      )
                : schema,
        ),

    sectionDescription: Yup.string()
        .trim()
        .required(PROGRAM_SECTION_VALIDATION.description.getRequiredError())
        .when('$isPublishing', ([isPublishing], schema) =>
            isPublishing
                ? schema
                      .min(
                          PROGRAM_SECTION_VALIDATION.description.min,
                          COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(PROGRAM_SECTION_VALIDATION.description.min),
                      )
                      .max(
                          PROGRAM_SECTION_VALIDATION.description.max,
                          COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(PROGRAM_SECTION_VALIDATION.description.max),
                      )
                : schema,
        ),
});

export const PROGRAM_SECTION_VALIDATION_FUNCTIONS = {
    validateSectionTitle: (value: string, isPublishing: boolean): string | undefined => {
        const context: ProgramValidationContext = { isPublishing };
        try {
            programSectionValidationSchema.validateSyncAt('sectionTitle', { sectionTitle: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateSectionDescription: (value: string, isPublishing: boolean): string | undefined => {
        const context: ProgramValidationContext = { isPublishing };
        try {
            programSectionValidationSchema.validateSyncAt(
                'sectionDescription',
                { sectionDescription: value },
                { context },
            );
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },
};

const getRequiredImageCountForTemplate = (template: ProgramSectionTemplate): number => {
    switch (template) {
        case ProgramSectionTemplate.TextOnly:
            return 0;
        case ProgramSectionTemplate.SingleImageBottom:
        case ProgramSectionTemplate.SingleImageTop:
        case ProgramSectionTemplate.SingleImageRight:
            return 1;
        case ProgramSectionTemplate.DualImagesBottom:
            return 2;
        case ProgramSectionTemplate.TripleImagesBottom:
            return 3;
        case ProgramSectionTemplate.QuadImagesBottom:
            return 4;
        default:
            return 0;
    }
};

const validateProgramSection = (section: ProgramSection, isPublishing: boolean): boolean => {
    const titleContent = section.contents.find((c) => c.contentType === ContentType.Title);
    const titleError = PROGRAM_SECTION_VALIDATION_FUNCTIONS.validateSectionTitle(
        titleContent?.title || '',
        isPublishing,
    );

    if (titleError) {
        return false;
    }

    const descriptionContent = section.contents.find((c) => c.contentType === ContentType.Description);

    const descriptionError = PROGRAM_SECTION_VALIDATION_FUNCTIONS.validateSectionDescription(
        descriptionContent?.description || '',
        isPublishing,
    );

    if (descriptionError) {
        return false;
    }

    if (isPublishing) {
        const requiredImageCount = getRequiredImageCountForTemplate(section.template);
        const imageContents = section.contents.filter((c) => c.contentType === ContentType.Image);

        if (imageContents.length < requiredImageCount) {
            return false;
        }

        const missingImages = imageContents.slice(0, requiredImageCount).filter((c) => !c.image);
        if (missingImages.length > 0) {
            return false;
        }
    }

    return true;
};

export const validateProgramSections = (sections: ProgramSection[], isPublishing: boolean): string | undefined => {
    if (!sections || sections.length === 0) {
        return undefined;
    }

    for (let i = 0; i < sections.length; i++) {
        const isValid = validateProgramSection(sections[i], isPublishing);
        if (!isValid) {
            return 'invalid';
        }
    }

    return undefined;
};
