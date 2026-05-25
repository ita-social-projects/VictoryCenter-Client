import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { CONTACT_FORM_LIMITS, CONTACT_FORM_MESSAGES } from '@/const/public/contact-form';
import { submitContactInquiry } from '@/services/api/public/contact/contact-api';
import styles from './ContactSection.module.scss';

const EMAIL_REGEX = /^[^\s@]+@[^\s@.]+\.[^\s@.]{2,}$/;

const buildSchema = (nameRequired: string, emailRequired: string, subjectRequired: string, messageRequired: string) =>
    yup.object({
        name: yup.string().trim().required(nameRequired),
        email: yup
            .string()
            .trim()
            .required(emailRequired)
            .matches(EMAIL_REGEX, { message: CONTACT_FORM_MESSAGES.EMAIL.INVALID, excludeEmptyString: true }),
        subject: yup
            .string()
            .trim()
            .min(CONTACT_FORM_LIMITS.SUBJECT.MIN, CONTACT_FORM_MESSAGES.SUBJECT.MIN_ERROR)
            .max(CONTACT_FORM_LIMITS.SUBJECT.MAX, CONTACT_FORM_MESSAGES.SUBJECT.LIMIT_REACHED)
            .required(subjectRequired),
        message: yup
            .string()
            .trim()
            .min(CONTACT_FORM_LIMITS.MESSAGE.MIN, CONTACT_FORM_MESSAGES.MESSAGE.MIN_ERROR)
            .max(CONTACT_FORM_LIMITS.MESSAGE.MAX, CONTACT_FORM_MESSAGES.MESSAGE.LIMIT_REACHED)
            .required(messageRequired),
    });

type FormData = {
    name: string;
    email: string;
    subject: string;
    message: string;
};

type SnackbarState = { open: boolean; message: string; type: 'success' | 'error' };

const getSubjectHint = (length: number): { text: string; type: 'warn' | 'error' } | null => {
    if (length >= CONTACT_FORM_LIMITS.SUBJECT.MAX) {
        return { text: CONTACT_FORM_MESSAGES.SUBJECT.LIMIT_REACHED, type: 'error' };
    }
    if (length >= CONTACT_FORM_LIMITS.SUBJECT.WARN_AT) {
        return {
            text: CONTACT_FORM_MESSAGES.SUBJECT.getWarnMessage(CONTACT_FORM_LIMITS.SUBJECT.MAX - length),
            type: 'warn',
        };
    }
    return null;
};

const getMessageHint = (length: number): { text: string; type: 'warn' | 'error' } | null => {
    if (length >= CONTACT_FORM_LIMITS.MESSAGE.MAX) {
        return { text: CONTACT_FORM_MESSAGES.MESSAGE.LIMIT_REACHED, type: 'error' };
    }
    if (length >= CONTACT_FORM_LIMITS.MESSAGE.WARN_AT) {
        return {
            text: CONTACT_FORM_MESSAGES.MESSAGE.getWarnMessage(CONTACT_FORM_LIMITS.MESSAGE.MAX - length),
            type: 'warn',
        };
    }
    return null;
};

export const ContactSection: React.FC = () => {
    const { t } = useTranslation('support-us');
    const [snackbar, setSnackbar] = useState<SnackbarState>({ open: false, message: '', type: 'success' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const schema = buildSchema(t('nameRequired'), t('emailRequired'), t('subjectRequired'), t('messageRequired'));

    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors },
    } = useForm<FormData>({
        resolver: yupResolver(schema),
        mode: 'onBlur',
    });

    const subjectValue = watch('subject') ?? '';
    const messageValue = watch('message') ?? '';
    const subjectHint = getSubjectHint(subjectValue.length);
    const messageHint = getMessageHint(messageValue.length);

    const showSnackbar = (message: string, type: 'success' | 'error', duration: number) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        setSnackbar({ open: true, message, type });
        timerRef.current = setTimeout(() => setSnackbar((s) => ({ ...s, open: false })), duration);
    };

    const onSubmit = async (data: FormData) => {
        setIsSubmitting(true);
        try {
            await submitContactInquiry({
                name: data.name.trim(),
                email: data.email.trim(),
                subject: data.subject.trim(),
                message: data.message.trim(),
            });
            reset();
            showSnackbar(t('successMessage'), 'success', 5000);
        } catch {
            showSnackbar(t('errorMessage'), 'error', 3000);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className={styles.section}>
            <div className={styles.container}>
                <div className={styles.textBlock}>
                    <h2 className={styles.title}>{t('contactSectionTitle')}</h2>
                    <p className={styles.description}>{t('contactSectionDescription')}</p>
                </div>

                <form
                    className={styles.form}
                    aria-label={t('contactSectionTitle')}
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                >
                    <div className={styles.fieldWrapper}>
                        <label className={`${styles.field}${errors.name ? ` ${styles['field--error']}` : ''}`}>
                            <input
                                type="text"
                                placeholder={t('namePlaceholder')}
                                className={styles.input}
                                {...register('name')}
                            />
                        </label>
                        {errors.name && (
                            <span className={styles.errorMsg} role="alert">
                                {errors.name.message}
                            </span>
                        )}
                    </div>

                    <div className={styles.fieldWrapper}>
                        <label className={`${styles.field}${errors.email ? ` ${styles['field--error']}` : ''}`}>
                            <input
                                type="email"
                                placeholder={t('emailPlaceholder')}
                                className={styles.input}
                                {...register('email')}
                            />
                        </label>
                        {errors.email && (
                            <span className={styles.errorMsg} role="alert">
                                {errors.email.message}
                            </span>
                        )}
                    </div>

                    <div className={styles.fieldWrapper}>
                        <label className={`${styles.field}${errors.subject ? ` ${styles['field--error']}` : ''}`}>
                            <input
                                type="text"
                                placeholder={t('subjectPlaceholder')}
                                className={styles.input}
                                maxLength={CONTACT_FORM_LIMITS.SUBJECT.MAX}
                                {...register('subject')}
                            />
                        </label>
                        {errors.subject && (
                            <span className={styles.errorMsg} role="alert">
                                {errors.subject.message}
                            </span>
                        )}
                        {!errors.subject && subjectHint && (
                            <span
                                className={subjectHint.type === 'error' ? styles.errorMsg : styles.infoMsg}
                                role="status"
                                aria-live="polite"
                            >
                                {subjectHint.text}
                            </span>
                        )}
                    </div>

                    <div className={styles.fieldWrapper}>
                        <label
                            className={`${styles.textareaField}${errors.message ? ` ${styles['field--error']}` : ''}`}
                        >
                            <textarea
                                placeholder={t('messagePlaceholder')}
                                className={styles.textarea}
                                rows={6}
                                maxLength={CONTACT_FORM_LIMITS.MESSAGE.MAX}
                                {...register('message')}
                            />
                        </label>
                        {errors.message && (
                            <span className={styles.errorMsg} role="alert">
                                {errors.message.message}
                            </span>
                        )}
                        {!errors.message && messageHint && (
                            <span
                                className={messageHint.type === 'error' ? styles.errorMsg : styles.infoMsg}
                                role="status"
                                aria-live="polite"
                            >
                                {messageHint.text}
                            </span>
                        )}
                    </div>

                    <button type="submit" className={styles.submitBtn} disabled={isSubmitting}>
                        {t('submitButton')}
                    </button>
                </form>

                {snackbar.open && (
                    <div
                        className={`${styles.snackbar} ${styles[`snackbar--${snackbar.type}`]}`}
                        role="status"
                        aria-live="polite"
                    >
                        {snackbar.message}
                    </div>
                )}
            </div>
        </section>
    );
};
