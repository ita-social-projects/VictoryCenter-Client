import { FAQ_VALIDATION } from '../../../const/admin/faq';
import * as Yup from 'yup';

export const FaqValidationSchema = Yup.object({
    question: Yup.string()
        .trim()
        .min(FAQ_VALIDATION.question.min, FAQ_VALIDATION.question.getMinError())
        .max(FAQ_VALIDATION.question.max, FAQ_VALIDATION.question.getMaxError()),

    answer: Yup.string()
        .trim()
        .min(FAQ_VALIDATION.answer.min, FAQ_VALIDATION.answer.getMinError())
        .max(FAQ_VALIDATION.answer.max, FAQ_VALIDATION.answer.getMaxError()),
});

export const FAQ_VALIDATION_FUNCTIONS = {
    validateQuestion: (value: string): string | undefined => {
        try {
            FaqValidationSchema.validateSyncAt('question', { question: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateAnswer: (value: string): string | undefined => {
        try {
            FaqValidationSchema.validateSyncAt('answer', { answer: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },
};
