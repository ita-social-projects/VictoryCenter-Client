import React, { useCallback, useMemo } from 'react';
import { ContactDetailsSection } from './components/contact-details-section/ContactDetailsSection';
import { ContactFormCard } from './components/contact-form-card/ContactFormCard';
import { CONTACT_US_PAGE_DATA } from '@/utils/mock-data/public';
import styles from './ContactUsPage.module.scss';
import { useTranslation } from 'react-i18next';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import {
    getPublicCompanyProfile,
    PublicCompanyProfileDto,
} from '@/services/api/public/company-profile/company-profile-api';
import { useGetLocalization } from '@/hooks/common/use-get-localization/useGetLocalization';
import { EntityLocalization, TranslationStatus } from '@/types/common/language';
import { LinearProgress } from '@mui/material';

export const ContactUsPage: React.FC = () => {
    const { t } = useTranslation('contactUsPage');

    const handleCopy = useCallback(async (value: string) => {
        await navigator.clipboard.writeText(value);
    }, []);

    const { data, isLoading } = useDataFetch<PublicCompanyProfileDto | null>({
        initialData: null,
        fetchHandler: getPublicCompanyProfile,
    });

    const localizations = useMemo<EntityLocalization[]>(() => {
        if (!data?.contacts?.localizations) {
            return [];
        }

        return data.contacts.localizations.flatMap((loc) => {
            if (!loc.localizationInfoDto?.code) {
                return [];
            }

            return [
                {
                    ...loc,
                    language: {
                        id: 0,
                        code: loc.localizationInfoDto.code,
                    },
                    translationStatus: TranslationStatus.Relevant,
                },
            ];
        });
    }, [data]);

    const fallback = useMemo(() => {
        return {
            address: data?.contacts?.address ?? '',
            motto: data?.contacts?.motto ?? '',
        };
    }, [data]);

    const { address, motto } = useGetLocalization(localizations, fallback);

    if (isLoading) {
        return (
            <div className={styles.loader}>
                <LinearProgress />
            </div>
        );
    }

    return (
        <section className={styles.root}>
            <div className={styles.container}>
                <ContactDetailsSection
                    title={t('title')}
                    description={t('description')}
                    contactsTitle={t('contactsTitle')}
                    socialLinksTitle={t('socialsTitle')}
                    email={CONTACT_US_PAGE_DATA.contacts.email}
                    phone={CONTACT_US_PAGE_DATA.contacts.phone}
                    address={address}
                    motto={motto}
                    socialLinks={CONTACT_US_PAGE_DATA.socialLinks}
                    copyEmailLabel={t('copyEmailAria')}
                    copyPhoneLabel={t('copyPhoneAria')}
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
