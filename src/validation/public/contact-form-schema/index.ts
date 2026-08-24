import * as yup from 'yup';
import { CONTACT_FORM_LIMITS } from '@/const/public/contact-form';
import { TFunction } from 'i18next';

const EMAIL_REGEX = /^[^\s@]+@[^\s@.]+\.[^\s@.]{2,}$/;

export const createContactFormSchema = (t: TFunction<'contactUsPage', undefined>) =>
    yup.object({
        name: yup.string().trim().required(t('contactForm.nameRequired')),
        email: yup
            .string()
            .trim()
            .required(t('contactForm.emailRequired'))
            .matches(EMAIL_REGEX, t('contactForm.emailInvalid')),
        subject: yup
            .string()
            .trim()
            .required(t('contactForm.subjectRequired'))
            .min(CONTACT_FORM_LIMITS.SUBJECT.MIN, t('contactForm.subjectMinLengthError'))
            .max(CONTACT_FORM_LIMITS.SUBJECT.MAX, t('contactForm.limitReached')),
        message: yup
            .string()
            .trim()
            .required(t('contactForm.messageRequired'))
            .min(CONTACT_FORM_LIMITS.MESSAGE.MIN, t('contactForm.messageMinLengthError'))
            .max(CONTACT_FORM_LIMITS.MESSAGE.MAX, t('contactForm.limitReached')),
    });

export type ContactFormData = yup.InferType<ReturnType<typeof createContactFormSchema>>;
