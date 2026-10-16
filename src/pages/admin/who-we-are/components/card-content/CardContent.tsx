import { useMemo, useState } from 'react';
import { ImageInput, ImageInputProps } from '@/components/admin/image-input/ImageInput';
import { RichTextInputGroup } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';
import { getPlainTextFromHtml } from '@/utils/functions/get-plain-text-from-html/get-plain-text-from-html';
import { returnDisplayedLocalization } from '@/utils/functions/localization/localization';
import { WHO_WE_ARE_VALIDATION_FUNCTIONS } from '@/validation/admin/who-we-are-schema/WhoWeAreSchema';
import { Content } from '@/types/admin/who-we-are';
import { ImageValues } from '@/types/common/image';
import { LocalizationLanguage } from '@/types/common/language';
import { WHO_WE_ARE_TEXT } from '@/const/admin/who-we-are';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import './CardContent.scss';

export interface CardContentProps {
    content: Content;
    onChange: (data: Content) => void;
    descriptionLimit: number;
    rows?: number;
    imageInputProps: Omit<ImageInputProps, 'className' | 'value' | 'onChange' | 'setError'>;
    onDescriptionValidate: (error: string | null) => void;
    imageError: string | null;
    setImageError: (value: string | null) => void;
    language: LocalizationLanguage;
}

export const CardContent = ({
    content,
    onChange,
    descriptionLimit,
    imageInputProps,
    onDescriptionValidate,
    imageError,
    setImageError,
    language,
}: CardContentProps) => {
    const [descriptionError, setDescriptionError] = useState<string | null>(null);
    const isBaseLanguage = language.code === DEFAULT_LOCALE;

    const displayedDescription = useMemo(() => {
        const displayedLocalization = returnDisplayedLocalization(content, language.code);
        return displayedLocalization?.description ?? content.description;
    }, [language.code, content]);

    const handleImageChange = (value: ImageValues | null) => {
        onChange({
            ...content,
            image: value,
        });
    };

    const handleDescriptionChange = (value: string) => {
        setDescriptionError(null);
        onDescriptionValidate(null);

        if (!isBaseLanguage) return;
        onChange({
            ...content,
            description: value,
        });
    };

    const handleDescriptionValidate = (value: string) => {
        const plainText = getPlainTextFromHtml(value);
        const error = WHO_WE_ARE_VALIDATION_FUNCTIONS.validateText(plainText) || null;

        setDescriptionError(error);
        onDescriptionValidate(error);
    };

    return (
        <div style={{ width: imageInputProps.style?.width }} className="card-content">
            <ImageInput
                value={content?.image ?? null}
                onChange={handleImageChange}
                label={WHO_WE_ARE_TEXT.IMAGE.INPUT}
                variant="whoWeAre"
                setError={setImageError}
                disabled={!isBaseLanguage}
                {...imageInputProps}
            />
            {imageError && <p className="error">{imageError}</p>}
            <div className="card-content-description-wrapper">
                <RichTextInputGroup
                    key={`description-${language.code}`}
                    label={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                    isRequired
                    onChange={handleDescriptionChange}
                    value={displayedDescription ?? ''}
                    maxLength={descriptionLimit}
                    name={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                    id={content.id.toString()}
                    onBlur={() => isBaseLanguage && handleDescriptionValidate(displayedDescription ?? '')}
                    error={isBaseLanguage ? (descriptionError ?? undefined) : undefined}
                    disabled={!isBaseLanguage}
                    hideToolbar={!isBaseLanguage}
                    normalizeSpaces
                    trimOnBlur
                />
            </div>
        </div>
    );
};
