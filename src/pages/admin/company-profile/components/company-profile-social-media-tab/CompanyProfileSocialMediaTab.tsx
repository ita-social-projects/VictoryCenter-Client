import { useFormContext, Controller, useFieldArray } from 'react-hook-form';
import { CustomFormGroup } from '../company-profile-form-group/CompanyProfileFormGroup';
import { COMPANY_PROFILE_TEXT } from '@/const/admin/company-profile';
import './CompanyProfileSocialMediaTab.scss';
import { useMemo, useState } from 'react';
import { SingleSelectInput } from '@/components/common/single-select-input/SingleSelectInput';
import { ReactComponent as EditIcon } from '@/assets/icons/edit.svg';
import { ReactComponent as DeleteIcon } from '@/assets/icons/delete.svg';
import { ButtonTooltip } from '@/components/admin/button-tooltip/ButtonTooltip';

type SocialPlatform =
    | 'Instagram'
    | 'Facebook'
    | 'Telegram'
    | 'YouTube'
    | 'Twitter/X'
    | 'WhatsApp'
    | 'LinkedIn'
    | 'Viber';

type SocialContact = {
    platform: SocialPlatform;
    url: string;
};

type FormValues = {
    socialContacts: SocialContact[];
};

const ALL_PLATFORMS: { id: SocialPlatform; name: SocialPlatform }[] = [
    { id: 'Instagram', name: 'Instagram' },
    { id: 'Facebook', name: 'Facebook' },
    { id: 'Telegram', name: 'Telegram' },
    { id: 'YouTube', name: 'YouTube' },
    { id: 'Twitter/X', name: 'Twitter/X' },
    { id: 'WhatsApp', name: 'WhatsApp' },
    { id: 'LinkedIn', name: 'LinkedIn' },
    { id: 'Viber', name: 'Viber' },
];

interface CompanyProfileSocialMediaTabProps {
    disabled: boolean;
}

export const CompanyProfileSocialMediaTab = ({ disabled }: CompanyProfileSocialMediaTabProps) => {
    const {
        control,
        formState: { errors },
        watch,
    } = useFormContext<FormValues>();

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'socialContacts',
    });

    const socialContacts = watch('socialContacts') ?? [];
    const selectedPlatforms = useMemo(() => new Set(socialContacts.map((c) => c.platform)), [socialContacts]);

    const availablePlatforms = useMemo(
        () => ALL_PLATFORMS.filter((p) => !selectedPlatforms.has(p.id)),
        [selectedPlatforms],
    );

    const isLimitReached = fields.length >= 4;

    const [selectedOption, setSelectedOption] = useState<{ id: SocialPlatform; name: SocialPlatform } | undefined>(
        undefined,
    );

    const handleAddPlatform = (opt: { id: SocialPlatform; name: SocialPlatform }) => {
        if (isLimitReached) return;

        append({ platform: opt.id, url: '' });
        setSelectedOption(undefined);
    };

    return (
        <div className="social-media-tab-container">
            <div className="form-row full-width social-media-tab-header">
                <h2 className="social-media-tab-title">{COMPANY_PROFILE_TEXT.SOCIAL_MEDIA_TAB.SECTION_TITLE}</h2>
                <ButtonTooltip position="bottom">Опубліковано на: Профайл Дозволено лише 4 контакти</ButtonTooltip>
            </div>

            {!disabled && (
                <div className="social-media-tab-add">
                    <SingleSelectInput
                        options={availablePlatforms}
                        value={selectedOption}
                        onChange={(opt) => {
                            setSelectedOption(opt);
                            handleAddPlatform(opt);
                        }}
                        getOptionId={(v) => v.id}
                        getOptionName={(v) => v.name}
                        placeholder="Додати контакт"
                        disabled={isLimitReached}
                        id="socialMediaSelect"
                    />

                    {isLimitReached && <div className="social-media-tab-limit-message">Дозволено лише 4 контакти.</div>}
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
                                        // TODO: edit handler (open modal / enable row edit / etc.)
                                        console.log('edit social contact', index);
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
