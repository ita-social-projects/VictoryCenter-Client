import { FAQ_VALIDATION } from '@/const/admin/faq';
import * as Yup from 'yup';
import { VisitorPage } from '@/types/admin/faq';

export const FaqValidationSchema = Yup.object({
    questionText: Yup.string()
        .trim()
        .required(FAQ_VALIDATION.question.getRequiredError())
        .min(FAQ_VALIDATION.question.min, FAQ_VALIDATION.question.getMinError())
        .max(FAQ_VALIDATION.question.max, FAQ_VALIDATION.question.getMaxError()),

    answerText: Yup.string()
        .trim()
        .required(FAQ_VALIDATION.answer.getRequiredWhenPublishingError())
        .min(FAQ_VALIDATION.answer.min, FAQ_VALIDATION.answer.getMinError())
        .max(FAQ_VALIDATION.answer.max, FAQ_VALIDATION.answer.getMaxError()),

    pages: Yup.array<VisitorPage>()
        .required(FAQ_VALIDATION.pages.getAtLeastOneRequiredError())
        .min(1, FAQ_VALIDATION.pages.getAtLeastOneRequiredError()),
});

export const FAQ_VALIDATION_FUNCTIONS = {
    validateQuestion: (value: string): string[] | undefined => {
        try {
            FaqValidationSchema.validateSyncAt('questionText', { questionText: value });
            return undefined;
        } catch (error: any) {
            return [error.message];
        }
    },

    validateAnswer: (value: string): string | undefined => {
        try {
            FaqValidationSchema.validateSyncAt('answerText', { answerText: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validatePages: (value: VisitorPage[]): string | undefined => {
        try {
            FaqValidationSchema.validateSyncAt('pages', { pages: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },
};
