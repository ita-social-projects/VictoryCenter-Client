import React from 'react';
import styles from './ContactFormCard.module.scss';

interface ContactFormCardProps {
    title: string;
    namePlaceholder: string;
    emailPlaceholder: string;
    subjectPlaceholder: string;
    messagePlaceholder: string;
    submitLabel: string;
}

export const ContactFormCard: React.FC<ContactFormCardProps> = ({
    title,
    namePlaceholder,
    emailPlaceholder,
    subjectPlaceholder,
    messagePlaceholder,
    submitLabel,
}) => {
    return (
        <form className={styles['contact-form-card']} aria-label={title}>
            <label className={styles['contact-form-field']}>
                <input type="text" placeholder={namePlaceholder} className={styles['contact-form-input']} />
            </label>
            <label className={styles['contact-form-field']}>
                <input type="email" placeholder={emailPlaceholder} className={styles['contact-form-input']} />
            </label>
            <label className={styles['contact-form-field']}>
                <input type="text" placeholder={subjectPlaceholder} className={styles['contact-form-input']} />
            </label>
            <label className={styles['contact-form-textarea-field']}>
                <textarea placeholder={messagePlaceholder} className={styles['contact-form-textarea']} rows={6} />
            </label>
            <button type="submit" className={styles['contact-form-submit']}>
                {submitLabel}
            </button>
        </form>
    );
};
