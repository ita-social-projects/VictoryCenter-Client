import { useFormContext, Controller, useFieldArray } from 'react-hook-form';
import { CustomFormGroup } from '../company-profile-form-group/CompanyProfileFormGroup';
import { COMPANY_PROFILE_TEXT } from '@/const/admin/company-profile';
import './CompanyProfileSocialMediaTab.scss';
import { useMemo } from 'react';
import { SingleSelectInput } from '@/components/common/single-select-input/SingleSelectInput';
import { ReactComponent as EditIcon } from '@/assets/icons/edit.svg';
import { ReactComponent as DeleteIcon } from '@/assets/icons/delete.svg';
import { ButtonTooltip } from '@/components/admin/button-tooltip/ButtonTooltip';
import { CompanyProfileFormValues, SocialPlatform } from '@/types/admin/company-profile';

interface CompanyProfileSocialMediaTabProps {
    disabled: boolean;
}

type SelectOption = { id: SocialPlatform; name: string };

const PLATFORM_ORDER: SocialPlatform[] = [
    'Instagram',
    'Facebook',
    'Telegram',
    'YouTube',
    'Twitter/X',
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

    const socialContacts = watch('socialContacts') ?? [];
    const selectedPlatforms = useMemo(() => new Set(socialContacts.map((c) => c.platform)), [socialContacts]);

    const platformOptions: SelectOption[] = useMemo(() => {
        const labels = COMPANY_PROFILE_TEXT.SOCIAL_MEDIA_TAB.PLATFORMS;

        const all: SelectOption[] = [
            { id: 'Instagram', name: labels.INSTAGRAM },
            { id: 'Facebook', name: labels.FACEBOOK },
            { id: 'Telegram', name: labels.TELEGRAM },
            { id: 'YouTube', name: labels.YOUTUBE },
            { id: 'Twitter/X', name: labels.X },
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

    return (
        <div className="social-media-tab-container">
            <div className="form-row full-width social-media-tab-header">
                <h2 className="social-media-tab-title">{COMPANY_PROFILE_TEXT.SOCIAL_MEDIA_TAB.SECTION_TITLE}</h2>

                {/* TODO (#958): tooltip content should be sourced from AC / mock, not hardcoded */}
                <ButtonTooltip position="bottom">Опубліковано на: Профайл</ButtonTooltip>
            </div>

            {!disabled && (
                <div className="social-media-tab-add">
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
                        <div className="social-media-tab-limit-message">
                            {COMPANY_PROFILE_TEXT.SOCIAL_MEDIA_TAB.LIMIT_MESSAGE}
                        </div>
                    )}
                </div>
            )}

            <div className="form-row social-media-tab-contacts">
                {fields.map((field, index) => (
                    <div className="social-media-contact" key={field.id}>
                        <div className="social-media-contact__header">
                            <div className="social-media-contact__label">
                                <span className="social-media-contact__label-text">{field.platform}</span>
                            </div>

                            <div className="social-media-contact__actions">
                                <button
                                    type="button"
                                    className="social-media-contact__icon-btn"
                                    onClick={() => {
                                        // TODO (#920): edit handler
                                    }}
                                    aria-label="Edit social contact"
                                >
                                    <EditIcon />
                                </button>

                                <button
                                    type="button"
                                    className="social-media-contact__icon-btn"
                                    onClick={() => remove(index)}
                                    aria-label="Delete social contact"
                                    disabled={disabled}
                                >
                                    <DeleteIcon />
                                </button>
                            </div>
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
                                    error={(errors.socialContacts?.[index]?.url?.message as string) ?? undefined}
                                />
                            )}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
