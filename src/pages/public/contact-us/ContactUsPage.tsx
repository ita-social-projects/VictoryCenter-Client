import React, { useCallback } from 'react';
import { ContactDetailsSection } from './components/contact-details-section/ContactDetailsSection';
import { ContactFormCard } from './components/contact-form-card/ContactFormCard';
import { CONTACT_US_PAGE_DATA } from '@/utils/mock-data/public';
import styles from './ContactUsPage.module.scss';

export const ContactUsPage: React.FC = () => {
    const handleCopy = useCallback(async (value: string) => {
        await navigator.clipboard.writeText(value);
    }, []);

    return (
        <section className={styles.root}>
            <div className={styles.container}>
                <ContactDetailsSection
                    title={CONTACT_US_PAGE_DATA.title}
                    description={CONTACT_US_PAGE_DATA.description}
                    contactsTitle={CONTACT_US_PAGE_DATA.contactsTitle}
                    socialLinksTitle={CONTACT_US_PAGE_DATA.socialLinksTitle}
                    email={CONTACT_US_PAGE_DATA.contacts.email}
                    phone={CONTACT_US_PAGE_DATA.contacts.phone}
                    address={CONTACT_US_PAGE_DATA.contacts.address}
                    motto={CONTACT_US_PAGE_DATA.contacts.motto}
                    socialLinks={CONTACT_US_PAGE_DATA.socialLinks}
                    copyEmailLabel={CONTACT_US_PAGE_DATA.copyEmailAria}
                    copyPhoneLabel={CONTACT_US_PAGE_DATA.copyPhoneAria}
                    onCopyEmail={() => handleCopy(CONTACT_US_PAGE_DATA.contacts.email)}
                    onCopyPhone={() => handleCopy(CONTACT_US_PAGE_DATA.contacts.phone)}
                />
                <ContactFormCard
                    title={CONTACT_US_PAGE_DATA.formLabel}
                    namePlaceholder={CONTACT_US_PAGE_DATA.namePlaceholder}
                    emailPlaceholder={CONTACT_US_PAGE_DATA.emailPlaceholder}
                    subjectPlaceholder={CONTACT_US_PAGE_DATA.subjectPlaceholder}
                    messagePlaceholder={CONTACT_US_PAGE_DATA.messagePlaceholder}
                    submitLabel={CONTACT_US_PAGE_DATA.submitButton}
                />
            </div>
        </section>
    );
};
