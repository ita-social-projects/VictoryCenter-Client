import * as yup from 'yup';
import { CONTACT_FORM_LIMITS, CONTACT_FORM_MESSAGES } from '@/const/public/contact-form';

export const contactFormSchema = yup.object({
    name: yup.string().required(),
    email: yup.string().email().required(),
    subject: yup
        .string()
        .min(CONTACT_FORM_LIMITS.SUBJECT.MIN, CONTACT_FORM_MESSAGES.SUBJECT.MIN_ERROR)
        .max(CONTACT_FORM_LIMITS.SUBJECT.MAX, CONTACT_FORM_MESSAGES.SUBJECT.LIMIT_REACHED)
        .required(),
    message: yup
        .string()
        .min(CONTACT_FORM_LIMITS.MESSAGE.MIN, CONTACT_FORM_MESSAGES.MESSAGE.MIN_ERROR)
        .max(CONTACT_FORM_LIMITS.MESSAGE.MAX, CONTACT_FORM_MESSAGES.MESSAGE.LIMIT_REACHED)
        .required(),
});

export type ContactFormData = yup.InferType<typeof contactFormSchema>;
