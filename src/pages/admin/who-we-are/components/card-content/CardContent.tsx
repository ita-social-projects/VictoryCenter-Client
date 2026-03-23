import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { useMemo } from 'react';
import { ImageInput, ImageInputProps } from '@/components/admin/image-input/ImageInput';
import { Content } from '@/types/admin/who-we-are';
import { ImageValues } from '@/types/common/image';
import { WHO_WE_ARE_TEXT } from '@/const/admin/who-we-are';
import { RichTextInputGroup } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';
import './CardContent.scss';
import { LocalizationLanguage } from '@/types/common/language';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { returnDisplayedLocalization } from '@/utils/functions/localization/localization';

export interface CardContentProps {
    content: Content;
    onChange: (data: Content) => void;
    descriptionLimit: number;
    rows?: number;
    imageInputProps: Omit<ImageInputProps, 'className' | 'value' | 'onChange' | 'setError'>;
    onDescriptionValidate: (value: string) => void;
    descriptionError: string | null;
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
    descriptionError,
    imageError,
    setImageError,
    language,
}: CardContentProps) => {
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
        if (!isBaseLanguage) return;
        onChange({
            ...content,
            description: value,
        });
        onDescriptionValidate(value);
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
                    onChange={handleDescriptionChange}
                    value={displayedDescription ?? ''}
                    maxLength={descriptionLimit}
                    name={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                    id={content.id.toString()}
                    onBlur={() => isBaseLanguage && onDescriptionValidate(displayedDescription ?? '')}
                    error={isBaseLanguage ? (descriptionError ?? undefined) : undefined}
                    disabled={!isBaseLanguage}
                    hideToolbar={!isBaseLanguage}
                />
            </div>
        </div>
    );
};
