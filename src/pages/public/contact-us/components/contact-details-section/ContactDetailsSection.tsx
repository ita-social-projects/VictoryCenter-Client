import React, { useState, useRef } from 'react';
import { Button } from '@/components/public/ui/button';
import { ReactComponent as MailIcon } from '@/assets/icons/mail.svg';
import { ReactComponent as PhoneIcon } from '@/assets/icons/phone.svg';
import { ReactComponent as MapPinIcon } from '@/assets/icons/map-pin.svg';
import { ReactComponent as CopyIcon } from '@/assets/icons/copy.svg';
import { ContactUsSocialLink } from '@/types/public/company-profile';
import styles from './ContactDetailsSection.module.scss';
import { useTranslation } from 'react-i18next';

interface ContactDetailsSectionProps {
    title: string;
    description: string;
    contactsTitle: string;
    socialLinksTitle: string;
    email: string;
    phone: string;
    address: string;
    motto: string;
    socialLinks: ContactUsSocialLink[];
    copyEmailLabel: string;
    copyPhoneLabel: string;
    onCopyEmail: () => void;
    onCopyPhone: () => void;
}

export const ContactDetailsSection: React.FC<ContactDetailsSectionProps> = ({
    title,
    description,
    contactsTitle,
    socialLinksTitle,
    email,
    phone,
    address,
    motto,
    socialLinks,
    copyEmailLabel,
    copyPhoneLabel,
    onCopyEmail,
    onCopyPhone,
}) => {
    const { t } = useTranslation('global');

    const [copiedItem, setCopiedItem] = useState<'email' | 'phone' | null>(null);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleCopy = (type: 'email' | 'phone', callback: () => void) => {
        callback();
        if (timerRef.current) clearTimeout(timerRef.current);
        setCopiedItem(type);
        timerRef.current = setTimeout(() => setCopiedItem(null), 2000);
    };
    return (
        <section className={styles['contact-details-section']} aria-label={title}>
            <div className={styles['contact-details-title-block']}>
                <h1 className={styles['contact-details-title']}>{title}</h1>
                <p className={styles['contact-details-description']}>{description}</p>
            </div>

            <div className={styles['contact-details-block']}>
                <h2 className={styles['contact-details-block-title']}>{contactsTitle}</h2>

                <div className={styles['contact-details-list']}>
                    <div className={styles['contact-details-item']}>
                        <MailIcon className={styles['contact-details-icon']} aria-hidden="true" />
                        <p className={styles['contact-details-text']}>{email}</p>
                        <div className={styles['copy-wrapper']}>
                            <Button
                                variant="tertiary"
                                className={styles['contact-details-copy']}
                                onClick={() => handleCopy('email', onCopyEmail)}
                                ariaLabel={copyEmailLabel}
                                icon={CopyIcon}
                            />
                            {copiedItem === 'email' && (
                                <span className={styles['copy-snackbar']} role="status" aria-live="polite">
                                    {t('COPIED_GLOBAL_MESSAGE')}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className={styles['contact-details-item']}>
                        <PhoneIcon className={styles['contact-details-icon']} aria-hidden="true" />
                        <p className={styles['contact-details-text']}>{phone}</p>
                        <div className={styles['copy-wrapper']}>
                            <Button
                                variant="tertiary"
                                className={styles['contact-details-copy']}
                                onClick={() => handleCopy('phone', onCopyPhone)}
                                ariaLabel={copyPhoneLabel}
                                icon={CopyIcon}
                            />
                            {copiedItem === 'phone' && (
                                <span className={styles['copy-snackbar']} role="status" aria-live="polite">
                                    {t('COPIED_GLOBAL_MESSAGE')}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className={styles['contact-details-item']}>
                        <MapPinIcon className={styles['contact-details-icon']} aria-hidden="true" />
                        <p className={styles['contact-details-address']}>
                            {address}
                            <br />
                            {motto}
                        </p>
                    </div>
                </div>
            </div>

            <div className={styles['social-links-block']}>
                <h2 className={styles['contact-details-block-title']}>{socialLinksTitle}</h2>
                <div className={styles['social-links-list']}>
                    {socialLinks.map((link) => (
                        <a
                            key={`${link.label}-${link.url}`}
                            className={styles['social-links-item']}
                            href={link.url}
                            target="_blank"
                            rel="noreferrer noopener"
                        >
                            {link.label}
                        </a>
                    ))}
                </div>
            </div>
        </section>
    );
};
