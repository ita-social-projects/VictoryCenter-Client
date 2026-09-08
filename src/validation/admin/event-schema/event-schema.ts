import * as Yup from 'yup';
import { EVENT_VALIDATION } from '@/const/admin/events';
import { Image, ImageValues } from '@/types/common/image';

export const EventValidationSchema = Yup.object({
    title: Yup.string()
        .trim()
        .required(EVENT_VALIDATION.title.getRequiredError())
        .min(EVENT_VALIDATION.title.min, EVENT_VALIDATION.title.getMinError())
        .max(EVENT_VALIDATION.title.max, EVENT_VALIDATION.title.getMaxError()),

    description: Yup.string()
        .trim()
        .max(EVENT_VALIDATION.description.max, EVENT_VALIDATION.description.getMaxError())
        .test('min-length-if-not-empty', EVENT_VALIDATION.description.getMinError(), (value) => {
            return !value || value.length >= EVENT_VALIDATION.description.min;
        })
        .when('$isPublishing', ([isPublishing], schema) =>
            isPublishing ? schema.required(EVENT_VALIDATION.description.getRequiredError()) : schema.notRequired(),
        ),

    additionalDescription: Yup.string()
        .trim()
        .max(EVENT_VALIDATION.additionalDescription.max, EVENT_VALIDATION.additionalDescription.getMaxError())
        .test('min-length-if-not-empty', EVENT_VALIDATION.additionalDescription.getMinError(), (value) => {
            return !value || value.length >= EVENT_VALIDATION.additionalDescription.min;
        }),

    linkUkr: Yup.string()
        .trim()
        .required(EVENT_VALIDATION.linkUkr.getRequiredError())
        .min(EVENT_VALIDATION.linkUkr.min, EVENT_VALIDATION.linkUkr.getMinError())
        .max(EVENT_VALIDATION.linkUkr.max, EVENT_VALIDATION.linkUkr.getMaxError()),

    linkEng: Yup.string()
        .trim()
        .max(EVENT_VALIDATION.linkEng.max, EVENT_VALIDATION.linkEng.getMaxError())
        .test('min-length-if-not-empty', EVENT_VALIDATION.linkEng.getMinError(), (value) => {
            return !value || value.length >= EVENT_VALIDATION.linkEng.min;
        }),

    publishDate: Yup.string().nullable().notRequired(),

    image: Yup.mixed<Image | ImageValues>().nullable().notRequired(),
});

export type EventFormValues = Yup.InferType<typeof EventValidationSchema>;
