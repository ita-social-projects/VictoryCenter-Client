import { useFormContext, Controller, useFieldArray } from 'react-hook-form';
import { useState } from 'react';
import { CustomFormGroup } from '../company-profile-form-group/CompanyProfileFormGroup';
import { COMPANY_PROFILE_TEXT } from '@/const/admin/company-profile';
import styles from './CompanyProfileSocialMediaTab.module.scss';
import { useMemo } from 'react';
import { SingleSelectInput } from '@/components/common/single-select-input/SingleSelectInput';
import { IconButton } from '@/components/admin/icon-button/IconButton';
import { ACTION_ICONS } from '@/const/common/action-icons';
import { ButtonTooltip } from '@/components/admin/button-tooltip/ButtonTooltip';
import { CompanyProfileFormValues, SocialPlatform } from '@/types/admin/company-profile';
import { CompanyProfileDeleteSocialModal } from '../company-profile-delete-social-modal/CompanyProfileDeleteSocialModal';

interface CompanyProfileSocialMediaTabProps {
    disabled: boolean;
}

type SelectOption = { id: SocialPlatform; name: string };

const PLATFORM_ORDER: SocialPlatform[] = [
    'Instagram',
    'Facebook',
    'Telegram',
    'YouTube',
    'X',
    'WhatsApp',
    'LinkedIn',
    'Viber',
];

export const CompanyProfileSocialMediaTab = ({ disabled }: CompanyProfileSocialMediaTabProps) => {
    const {
        control,
        formState: { errors },
        watch,
    } = useFormContext<CompanyProfileFormValues>();

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'socialContacts',
    });

    const [deleteIndex, setDeleteIndex] = useState<number | null>(null);

    const watchedSocialContacts = watch('socialContacts');

    const selectedPlatforms = useMemo(() => {
        const contacts = watchedSocialContacts ?? [];
        return new Set(contacts.map((c) => c.platform));
    }, [watchedSocialContacts]);

    const platformOptions: SelectOption[] = useMemo(() => {
        const labels = COMPANY_PROFILE_TEXT.SOCIAL_MEDIA_TAB.PLATFORMS;

        const all: SelectOption[] = [
            { id: 'Instagram', name: labels.INSTAGRAM },
            { id: 'Facebook', name: labels.FACEBOOK },
            { id: 'Telegram', name: labels.TELEGRAM },
            { id: 'YouTube', name: labels.YOUTUBE },
            { id: 'X', name: labels.X },
            { id: 'WhatsApp', name: labels.WHATSAPP },
            { id: 'LinkedIn', name: labels.LINKEDIN },
            { id: 'Viber', name: labels.VIBER },
        ];

        const order = new Map(PLATFORM_ORDER.map((p, idx) => [p, idx]));
        return all.sort((a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999));
    }, []);

    const availablePlatforms = useMemo(
        () => platformOptions.filter((p) => !selectedPlatforms.has(p.id)),
        [platformOptions, selectedPlatforms],
    );

    const isLimitReached = fields.length >= 4;

    const handleAddPlatform = (opt: SelectOption) => {
        if (disabled || isLimitReached) return;
        append({ platform: opt.id, url: '' });
    };

    const handleDeleteClick = (index: number) => {
        setDeleteIndex(index);
    };

    const handleConfirmDelete = () => {
        if (deleteIndex !== null) {
            remove(deleteIndex);
            setDeleteIndex(null);
        }
    };

    const handleCancelDelete = () => {
        setDeleteIndex(null);
    };

    const showCounter = !disabled;

    return (
        <div className={styles['social-media-tab-container']}>
            <div className={styles['social-media-tab-header']}>
                <h2 className={styles['social-media-tab-title']}>
                    {COMPANY_PROFILE_TEXT.SOCIAL_MEDIA_TAB.SECTION_TITLE}
                </h2>
                <ButtonTooltip position="bottom">Опубліковано на: Профайл</ButtonTooltip>
            </div>

            {!disabled && (
                <div className={styles['social-media-tab-add']}>
                    <SingleSelectInput
                        options={availablePlatforms}
                        value={undefined}
                        onChange={handleAddPlatform}
                        getOptionId={(v) => v.id}
                        getOptionName={(v) => v.name}
                        placeholder={COMPANY_PROFILE_TEXT.SOCIAL_MEDIA_TAB.ADD_CONTACT_PLACEHOLDER}
                        disabled={isLimitReached}
                        id="socialMediaSelect"
                    />

                    {isLimitReached && (
                        <div className={styles['social-media-tab-limit-message']}>
                            {COMPANY_PROFILE_TEXT.SOCIAL_MEDIA_TAB.LIMIT_MESSAGE}
                        </div>
                    )}
                </div>
            )}

            <div className={styles['social-media-tab-contacts']}>
                {fields.map((field, index) => (
                    <div className={styles['social-media-contact']} key={field.id}>
                        <div className={styles['social-media-contact-header']}>
                            <div className={styles['social-media-contact-label']}>
                                <span className={styles['social-media-contact-label-text']}>{field.platform}</span>
                            </div>

                            {fields.length > 1 && (
                                <div className={styles['social-media-contact-actions']}>
                                    <IconButton
                                        type="button"
                                        className={styles['social-media-contact-icon-btn']}
                                        onClick={() => handleDeleteClick(index)}
                                        aria-label="Delete social contact"
                                        disabled={disabled}
                                        DefaultIcon={ACTION_ICONS.delete.default}
                                        FilledIcon={ACTION_ICONS.delete.hover}
                                    />
                                </div>
                            )}
                        </div>

                        <Controller
                            name={`socialContacts.${index}.url`}
                            control={control}
                            render={({ field: urlField }) => (
                                <CustomFormGroup
                                    {...urlField}
                                    id={`socialContacts.${index}.url`}
                                    labelText={field.platform}
                                    hideLabel={true}
                                    isRequired={false}
                                    maxLength={500}
                                    disabled={disabled}
                                    showCounter={showCounter}
                                    error={(errors.socialContacts?.[index]?.url?.message as string) ?? undefined}
                                />
                            )}
                        />
                    </div>
                ))}
            </div>

            <CompanyProfileDeleteSocialModal
                isOpen={deleteIndex !== null}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
            />
        </div>
    );
};
