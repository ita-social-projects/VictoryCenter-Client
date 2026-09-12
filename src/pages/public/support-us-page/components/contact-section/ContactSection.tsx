import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useForm, UseFormRegisterReturn } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { ToastItem } from '@/components/admin/toast/toast-item/ToastItem';
import { Toast, ToastType } from '@/types/admin/toast';
import { createContactFormSchema, ContactFormData } from '@/validation/public/contact-form-schema';
import { CONTACT_FORM_LIMITS } from '@/const/public/contact-form';
import { useTurnstile } from '@/hooks/public/use-turnstile';
import { submitContactUsForm } from '@/services/api/public/contact-us/contact-us-api';
import classNames from 'classnames';
import styles from './ContactSection.module.scss';

const CF_TURNSTILE_SITE_KEY = process.env.REACT_APP_CF_TURNSTILE_SITE_KEY ?? '';

interface ContactFormProps {
    title: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    subjectPlaceholder: string;
    messagePlaceholder: string;
    submitLabel: string;
}

interface FieldProps {
    error?: string;
    children: React.ReactNode;
}

interface ContactFieldProps {
    placeholder: string;
    className: string;
    registration: UseFormRegisterReturn;
    onBlur: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    type?: React.HTMLInputTypeAttribute;
    maxLength?: number;
    multiline?: boolean;
}

const Field: React.FC<FieldProps> = ({ error, children }) => (
    <div className={styles['field-wrapper']}>
        {children}
        {error && (
            <span className={styles.error} role="alert">
                {error}
            </span>
        )}
    </div>
);

const ContactField: React.FC<ContactFieldProps> = ({
    placeholder,
    className,
    registration,
    onBlur,
    type = 'text',
    maxLength,
    multiline = false,
}) => (
    <label className={className}>
        {multiline ? (
            <textarea
                placeholder={placeholder}
                data-testid={`contact-field-${registration.name}`}
                className={styles.textarea}
                rows={6}
                maxLength={maxLength}
                {...registration}
                onBlur={onBlur}
            />
        ) : (
            <input
                type={type}
                placeholder={placeholder}
                data-testid={`contact-field-${registration.name}`}
                className={styles.input}
                maxLength={maxLength}
                {...registration}
                onBlur={onBlur}
            />
        )}
    </label>
);

const getHint = (
    value: string,
    limit: { MAX: number; INFO_AT: number } | undefined,
    t: TFunction<'contactUsPage', undefined>,
) => {
    if (!limit) return null;
    if (value.length >= limit.MAX) return { text: t('contactForm.limitReached'), type: 'error' as const };
    if (value.length >= limit.INFO_AT) {
        return {
            text: t('contactForm.charactersRemaining', { count: limit.MAX - value.length }),
            type: 'warn' as const,
        };
    }
    return null;
};

const ContactForm: React.FC<ContactFormProps> = ({
    title,
    namePlaceholder,
    emailPlaceholder,
    subjectPlaceholder,
    messagePlaceholder,
    submitLabel,
}) => {
    const { t } = useTranslation('contactUsPage');
    const contactFormSchema = useMemo(() => createContactFormSchema(t), [t]);
    const requiredMessages = useMemo(
        () => ({
            name: t('contactForm.nameRequired'),
            email: t('contactForm.emailRequired'),
            subject: t('contactForm.subjectRequired'),
            message: t('contactForm.messageRequired'),
        }),
        [t],
    );
    const {
        register,
        handleSubmit,
        watch,
        reset,
        setValue,
        formState: { errors, touchedFields, isSubmitted },
    } = useForm<ContactFormData>({
        resolver: yupResolver(contactFormSchema),
        mode: 'onBlur',
    });
    const { token, containerRef, reset: resetTurnstile } = useTurnstile(CF_TURNSTILE_SITE_KEY);
    const [toast, setToast] = useState<Toast | null>(null);
    const prevTokenRef = useRef<string | null>(token);
    const isSubmittedSuccessRef = useRef(false);
    const nameRegistration = register('name');
    const emailRegistration = register('email');
    const subjectRegistration = register('subject');
    const messageRegistration = register('message');
    const emailValue = watch('email') ?? '';
    const subjectValue = watch('subject') ?? '';
    const messageValue = watch('message') ?? '';
    const subjectHint = getHint(subjectValue, CONTACT_FORM_LIMITS.SUBJECT, t);
    const messageHint = getHint(messageValue, CONTACT_FORM_LIMITS.MESSAGE, t);

    const trimOnBlur =
        (field: keyof ContactFormData) => (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setValue(field, event.target.value.trim(), { shouldDirty: true, shouldValidate: true });
        };

    const showToast = (message: string, type: ToastType, duration: number) => {
        const id = Date.now();
        setToast({ id, message, type, duration });
        setTimeout(() => setToast((current) => (current?.id === id ? null : current)), duration);
    };

    useEffect(() => {
        if (prevTokenRef.current && !token && !isSubmittedSuccessRef.current) {
            showToast(t('contactForm.captchaRequired'), ToastType.Error, 3000);
        }
        if (isSubmittedSuccessRef.current && !token) {
            isSubmittedSuccessRef.current = false;
        }
        prevTokenRef.current = token;
    }, [token, t]);

    const onSubmit = async (data: ContactFormData) => {
        if (!token) {
            showToast(t('contactForm.captchaRequired'), ToastType.Error, 3000);
            return;
        }
        try {
            await submitContactUsForm({
                captchaResponseToken: token,
                fromName: data.name,
                fromEmail: data.email,
                subject: data.subject,
                message: data.message,
            });
            isSubmittedSuccessRef.current = true;
            reset();
            resetTurnstile();
            showToast(t('contactForm.submitSuccess'), ToastType.Success, 5000);
        } catch {
            showToast(t('contactForm.submitError'), ToastType.Error, 3000);
        }
    };

    const fieldClass = (hasError: boolean) =>
        classNames(styles.field, {
            [styles['field--error']]: hasError,
        });
    const messageClass = (type: 'error' | 'warn') => (type === 'error' ? styles.error : styles.info);
    const isEmpty = (value?: string) => value !== undefined && !value.trim();
    const isFieldTouched = (field: keyof ContactFormData) => Boolean(touchedFields[field]) || isSubmitted;
    const getErrorMessage = (field: keyof typeof requiredMessages, message?: string, type?: string, value?: string) =>
        isFieldTouched(field) && (type === 'required' || isEmpty(value)) ? requiredMessages[field] : message;

    return (
        <>
            {toast && (
                <div className={styles.toast}>
                    <ToastItem toast={toast} />
                </div>
            )}
            <form className={styles.form} aria-label={title} onSubmit={handleSubmit(onSubmit)} noValidate>
                <Field error={getErrorMessage('name', errors.name?.message, errors.name?.type)}>
                    <ContactField
                        placeholder={namePlaceholder}
                        className={fieldClass(Boolean(errors.name) && isFieldTouched('name'))}
                        registration={nameRegistration}
                        onBlur={(event) => {
                            nameRegistration.onBlur(event);
                            trimOnBlur('name')(event);
                        }}
                    />
                </Field>
                <Field error={getErrorMessage('email', errors.email?.message, errors.email?.type, emailValue)}>
                    <ContactField
                        placeholder={emailPlaceholder}
                        className={fieldClass(Boolean(errors.email) && isFieldTouched('email'))}
                        registration={emailRegistration}
                        onBlur={(event) => {
                            emailRegistration.onBlur(event);
                            trimOnBlur('email')(event);
                        }}
                        type="email"
                    />
                </Field>
                <Field error={getErrorMessage('subject', errors.subject?.message, errors.subject?.type, subjectValue)}>
                    <ContactField
                        placeholder={subjectPlaceholder}
                        className={fieldClass(Boolean(errors.subject) && isFieldTouched('subject'))}
                        registration={subjectRegistration}
                        onBlur={(event) => {
                            subjectRegistration.onBlur(event);
                            trimOnBlur('subject')(event);
                        }}
                        maxLength={CONTACT_FORM_LIMITS.SUBJECT.MAX}
                    />
                </Field>
                {!errors.subject && subjectHint && (
                    <span className={messageClass(subjectHint.type)} role="status">
                        {subjectHint.text}
                    </span>
                )}
                <Field error={getErrorMessage('message', errors.message?.message, errors.message?.type, messageValue)}>
                    <ContactField
                        placeholder={messagePlaceholder}
                        className={classNames(
                            fieldClass(Boolean(errors.message) && isFieldTouched('message')),
                            styles['field--textarea'],
                        )}
                        registration={messageRegistration}
                        onBlur={(event) => {
                            messageRegistration.onBlur(event);
                            trimOnBlur('message')(event);
                        }}
                        maxLength={CONTACT_FORM_LIMITS.MESSAGE.MAX}
                        multiline
                    />
                </Field>
                {!errors.message && messageHint && (
                    <span className={messageClass(messageHint.type)} role="status">
                        {messageHint.text}
                    </span>
                )}
                <div ref={containerRef} />
                <button type="submit" className={styles.submit} disabled={!token || Object.keys(errors).length > 0}>
                    {submitLabel}
                </button>
            </form>
        </>
    );
};

export const ContactSection = () => {
    const { t } = useTranslation('supportUsPage');
    const blueHighlightClass = classNames(styles.highlight, styles.blue, styles['break-text']);
    const formTitle = t('SUPPORT_INQUIRY.TITLE');

    return (
        <>
            <section className={styles.root} aria-labelledby="support-inquiry-title">
                <div className={styles.content}>
                    <h4 className={styles.title} data-testid="title-section" id="support-inquiry-title">
                        <span className={blueHighlightClass}>{t('SUPPORT_INQUIRY.TITLE')}</span>
                    </h4>
                    <p className={styles.description}>{t('SUPPORT_INQUIRY.DESCRIPTION.FIRST_TEXT')}</p>
                    <p className={classNames(styles.description, styles['bold-description'])}>
                        {t('SUPPORT_INQUIRY.DESCRIPTION.SECOND_BOLD_TEXT')}
                    </p>
                </div>
                <div className={styles['form-container']}>
                    <ContactForm
                        title={formTitle}
                        namePlaceholder={t('SUPPORT_INQUIRY.FORM.NAME')}
                        emailPlaceholder={t('SUPPORT_INQUIRY.FORM.EMAIL')}
                        subjectPlaceholder={t('SUPPORT_INQUIRY.FORM.SUBJECT')}
                        messagePlaceholder={t('SUPPORT_INQUIRY.FORM.MESSAGE')}
                        submitLabel={t('SUPPORT_INQUIRY.FORM.SUBMIT_BUTTON')}
                    />
                </div>
            </section>
        </>
    );
};
