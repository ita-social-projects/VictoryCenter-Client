import * as yup from 'yup';
import { CONTACT_FORM_LIMITS, CONTACT_FORM_MESSAGES } from '@/const/public/contact-form';

const EMAIL_REGEX = /^[^\s@]+@[^\s@.]+\.[^\s@.]{2,}$/;

export const contactFormSchema = yup.object({
    name: yup.string().trim().required(CONTACT_FORM_MESSAGES.NAME.REQUIRED),
    email: yup
        .string()
        .trim()
        .required(CONTACT_FORM_MESSAGES.EMAIL.REQUIRED)
        .matches(EMAIL_REGEX, CONTACT_FORM_MESSAGES.EMAIL.INVALID),
    subject: yup
        .string()
        .trim()
        .required(CONTACT_FORM_MESSAGES.SUBJECT.REQUIRED)
        .min(CONTACT_FORM_LIMITS.SUBJECT.MIN, CONTACT_FORM_MESSAGES.SUBJECT.MIN_ERROR)
        .max(CONTACT_FORM_LIMITS.SUBJECT.MAX, CONTACT_FORM_MESSAGES.SUBJECT.LIMIT_REACHED),
    message: yup
        .string()
        .trim()
        .required(CONTACT_FORM_MESSAGES.MESSAGE.REQUIRED)
        .min(CONTACT_FORM_LIMITS.MESSAGE.MIN, CONTACT_FORM_MESSAGES.MESSAGE.MIN_ERROR)
        .max(CONTACT_FORM_LIMITS.MESSAGE.MAX, CONTACT_FORM_MESSAGES.MESSAGE.LIMIT_REACHED),
});

export type ContactFormData = yup.InferType<typeof contactFormSchema>;
