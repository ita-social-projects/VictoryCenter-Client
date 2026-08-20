import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { createContactFormSchema, ContactFormData } from '@/validation/public/contact-form-schema';
import { CONTACT_FORM_LIMITS } from '@/const/public/contact-form';
import { useTurnstile } from '@/hooks/public/use-turnstile';
import { submitContactUsForm } from '@/services/api/public/contact-us/contact-us-api';
import { ToastItem } from '@/components/admin/toast/toast-item/ToastItem';
import { Toast, ToastType } from '@/types/admin/toast';
import styles from './ContactFormCard.module.scss';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';

const CF_TURNSTILE_SITE_KEY = process.env.REACT_APP_CF_TURNSTILE_SITE_KEY ?? '';

interface ContactFormCardProps {
    title: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    subjectPlaceholder: string;
    messagePlaceholder: string;
    submitLabel: string;
}

const getSubjectHint = (
    length: number,
    t: TFunction<'contactUsPage', undefined>,
): { text: string; type: 'warn' | 'error' } | null => {
    if (length >= CONTACT_FORM_LIMITS.SUBJECT.MAX) {
        return { text: t('contactForm.limitReached'), type: 'error' };
    }
    if (length >= CONTACT_FORM_LIMITS.SUBJECT.WARN_AT) {
        return {
            text: t('contactForm.charactersRemaining', {
                count: CONTACT_FORM_LIMITS.SUBJECT.MAX - length,
            }),
            type: 'warn',
        };
    }
    return null;
};

const getMessageHint = (
    length: number,
    t: TFunction<'contactUsPage', undefined>,
): { text: string; type: 'warn' | 'error' } | null => {
    if (length >= CONTACT_FORM_LIMITS.MESSAGE.MAX) {
        return { text: t('contactForm.limitReached'), type: 'error' };
    }
    if (length >= CONTACT_FORM_LIMITS.MESSAGE.WARN_AT) {
        return {
            text: t('contactForm.charactersRemaining', {
                count: CONTACT_FORM_LIMITS.MESSAGE.MAX - length,
            }),
            type: 'warn',
        };
    }
    return null;
};

export const ContactFormCard: React.FC<ContactFormCardProps> = ({
    title,
    namePlaceholder,
    emailPlaceholder,
    subjectPlaceholder,
    messagePlaceholder,
    submitLabel,
}) => {
    const { t, i18n } = useTranslation('contactUsPage');

    const contactFormSchema = useMemo(() => createContactFormSchema(t), [t]);

    const {
        register,
        handleSubmit,
        watch,
        reset,
        trigger,
        formState: { errors },
    } = useForm<ContactFormData>({
        resolver: yupResolver(contactFormSchema),
        mode: 'onBlur',
    });

    const errorsRef = useRef(errors);
    errorsRef.current = errors;

    useEffect(() => {
        const fieldsWithErrors = Object.keys(errorsRef.current) as (keyof ContactFormData)[];

        if (fieldsWithErrors.length > 0) {
            trigger(fieldsWithErrors);
        }
    }, [i18n.language, trigger]);

    const {
        token: turnstileToken,
        containerRef: turnstileRef,
        reset: resetTurnstile,
    } = useTurnstile(CF_TURNSTILE_SITE_KEY);

    const [toast, setToast] = useState<Toast | null>(null);

    const showToast = (message: string, type: ToastType, duration: number) => {
        const id = Date.now();
        setToast({ id, message, type, duration });
        setTimeout(() => {
            setToast((current) => (current?.id === id ? null : current));
        }, duration);
    };

    const subjectValue = watch('subject') ?? '';
    const messageValue = watch('message') ?? '';

    const subjectHint = getSubjectHint(subjectValue.length, t);
    const messageHint = getMessageHint(messageValue.length, t);

    const onSubmit = async (data: ContactFormData) => {
        if (!turnstileToken) return;

        try {
            await submitContactUsForm({
                captchaResponseToken: turnstileToken,
                fromName: data.name,
                fromEmail: data.email,
                subject: data.subject,
                message: data.message,
            });

            reset();
            resetTurnstile();
            showToast(t('contactForm.submitSuccess'), ToastType.Success, 5000);
        } catch (error) {
            showToast(t('contactForm.submitError'), ToastType.Error, 3000);
        }
    };

    return (
        <>
            {toast && (
                <div className={styles['toast-container']}>
                    <ToastItem toast={toast} />
                </div>
            )}
            <form
                className={styles['contact-form-card']}
                aria-label={title}
                onSubmit={handleSubmit(onSubmit)}
                noValidate
            >
                <div className={styles['contact-form-field-wrapper']}>
                    <label
                        className={`${styles['contact-form-field']}${errors.name ? ` ${styles['contact-form-field--error']}` : ''}`}
                    >
                        <input
                            type="text"
                            placeholder={namePlaceholder}
                            className={styles['contact-form-input']}
                            {...register('name')}
                        />
                    </label>
                    {errors.name && (
                        <span className={styles['contact-form-message--error']} role="alert">
                            {errors.name.message}
                        </span>
                    )}
                </div>

                <div className={styles['contact-form-field-wrapper']}>
                    <label
                        className={`${styles['contact-form-field']}${errors.email ? ` ${styles['contact-form-field--error']}` : ''}`}
                    >
                        <input
                            type="email"
                            placeholder={emailPlaceholder}
                            className={styles['contact-form-input']}
                            {...register('email')}
                        />
                    </label>
                    {errors.email && (
                        <span className={styles['contact-form-message--error']} role="alert">
                            {errors.email.message}
                        </span>
                    )}
                </div>

                <div className={styles['contact-form-field-wrapper']}>
                    <label
                        className={`${styles['contact-form-field']}${errors.subject ? ` ${styles['contact-form-field--error']}` : ''}`}
                    >
                        <input
                            type="text"
                            placeholder={subjectPlaceholder}
                            className={styles['contact-form-input']}
                            maxLength={CONTACT_FORM_LIMITS.SUBJECT.MAX}
                            {...register('subject')}
                        />
                    </label>
                    {errors.subject && (
                        <span className={styles['contact-form-message--error']} role="alert">
                            {errors.subject.message}
                        </span>
                    )}
                    {!errors.subject && subjectHint && (
                        <span
                            className={
                                subjectHint.type === 'error'
                                    ? styles['contact-form-message--error']
                                    : styles['contact-form-message--info']
                            }
                            role="status"
                            aria-live="polite"
                        >
                            {subjectHint.text}
                        </span>
                    )}
                </div>

                <div className={styles['contact-form-field-wrapper']}>
                    <label className={styles['contact-form-textarea-field']}>
                        <textarea
                            placeholder={messagePlaceholder}
                            className={styles['contact-form-textarea']}
                            rows={6}
                            maxLength={CONTACT_FORM_LIMITS.MESSAGE.MAX}
                            {...register('message')}
                        />
                    </label>
                    {errors.message && (
                        <span className={styles['contact-form-message--error']} role="alert">
                            {errors.message.message}
                        </span>
                    )}
                    {!errors.message && messageHint && (
                        <span
                            className={
                                messageHint.type === 'error'
                                    ? styles['contact-form-message--error']
                                    : styles['contact-form-message--info']
                            }
                            role="status"
                            aria-live="polite"
                        >
                            {messageHint.text}
                        </span>
                    )}
                </div>

                <div ref={turnstileRef} />

                <button type="submit" className={styles['contact-form-submit']} disabled={!turnstileToken}>
                    {submitLabel}
                </button>
            </form>
        </>
    );
};
