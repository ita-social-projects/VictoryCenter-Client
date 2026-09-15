import React, { useMemo, useState, useEffect, useRef } from 'react';
import classNames from 'classnames';
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
    isPopup?: boolean;
    title: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    subjectPlaceholder: string;
    messagePlaceholder: string;
    submitLabel: string;
}

const getCharacterLimitHint = (
    length: number,
    maxLength: number,
    infoAt: number,
    t: TFunction<'contactUsPage', undefined>,
): string | null => {
    if (length >= maxLength) {
        return t('contactForm.limitReached');
    }
    if (length >= infoAt) {
        return t('contactForm.charactersRemaining', {
            count: maxLength - length,
        });
    }
    return null;
};

export const ContactFormCard: React.FC<ContactFormCardProps> = ({
    isPopup = false,
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
        clearErrors,
        trigger,
        formState: { errors },
    } = useForm<ContactFormData>({
        resolver: yupResolver(contactFormSchema),
        mode: 'onBlur',
        reValidateMode: 'onBlur',
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

    const subjectHint = getCharacterLimitHint(
        subjectValue.length,
        CONTACT_FORM_LIMITS.SUBJECT.MAX,
        CONTACT_FORM_LIMITS.SUBJECT.INFO_AT,
        t,
    );
    const messageHint = getCharacterLimitHint(
        messageValue.length,
        CONTACT_FORM_LIMITS.MESSAGE.MAX,
        CONTACT_FORM_LIMITS.MESSAGE.INFO_AT,
        t,
    );

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
        } catch {
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
                className={classNames(styles['contact-form-card'], {
                    [styles['contact-form-card--popup']]: isPopup,
                })}
                aria-label={title}
                onSubmit={handleSubmit(onSubmit)}
                noValidate
            >
                <div className={styles['contact-form-field-wrapper']}>
                    <label
                        className={classNames(styles['contact-form-field'], {
                            [styles['contact-form-field--error']]: errors.name,
                        })}
                    >
                        <input
                            type="text"
                            placeholder={namePlaceholder}
                            className={styles['contact-form-input']}
                            {...register('name', {
                                onChange: () => {
                                    if (errors.name) clearErrors('name');
                                },
                            })}
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
                        className={classNames(styles['contact-form-field'], {
                            [styles['contact-form-field--error']]: errors.email,
                        })}
                    >
                        <input
                            type="email"
                            placeholder={emailPlaceholder}
                            className={styles['contact-form-input']}
                            {...register('email', {
                                onChange: () => {
                                    if (errors.email) clearErrors('email');
                                },
                            })}
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
                        className={classNames(styles['contact-form-field'], {
                            [styles['contact-form-field--error']]: errors.subject,
                        })}
                    >
                        <input
                            type="text"
                            placeholder={subjectPlaceholder}
                            className={styles['contact-form-input']}
                            maxLength={CONTACT_FORM_LIMITS.SUBJECT.MAX}
                            {...register('subject', {
                                onChange: () => {
                                    if (errors.subject) clearErrors('subject');
                                },
                            })}
                        />
                    </label>
                    {errors.subject && (
                        <span className={styles['contact-form-message--error']} role="alert">
                            {errors.subject.message}
                        </span>
                    )}
                    {!errors.subject && subjectHint && (
                        <span className={styles['contact-form-message--info']} role="status" aria-live="polite">
                            {subjectHint}
                        </span>
                    )}
                </div>

                <div
                    className={classNames(
                        styles['contact-form-field-wrapper'],
                        styles['contact-form-field-wrapper--textarea'],
                    )}
                >
                    <label
                        className={classNames(styles['contact-form-textarea-field'], {
                            [styles['contact-form-textarea-field--error']]: errors.message,
                        })}
                    >
                        <textarea
                            placeholder={messagePlaceholder}
                            className={styles['contact-form-textarea']}
                            rows={6}
                            maxLength={CONTACT_FORM_LIMITS.MESSAGE.MAX}
                            {...register('message', {
                                onChange: () => {
                                    if (errors.message) clearErrors('message');
                                },
                            })}
                        />
                    </label>
                    {errors.message && (
                        <span className={styles['contact-form-message--error']} role="alert">
                            {errors.message.message}
                        </span>
                    )}
                    {!errors.message && messageHint && (
                        <span className={styles['contact-form-message--info']} role="status" aria-live="polite">
                            {messageHint}
                        </span>
                    )}
                </div>

                <div ref={turnstileRef} />

                <button
                    type="submit"
                    className={styles['contact-form-submit']}
                    disabled={!turnstileToken || Object.keys(errors).length > 0}
                >
                    {submitLabel}
                </button>
            </form>
        </>
    );
};
