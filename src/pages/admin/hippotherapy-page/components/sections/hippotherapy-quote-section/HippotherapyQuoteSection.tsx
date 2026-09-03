import { CSSProperties, memo } from 'react';
import { ImageInput } from '@/components/admin/image-input/ImageInput';
import { RichTextInputGroup } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import {
    HIPPOTHERAPY_PAGE_CHAR_LIMITS,
    HIPPOTHERAPY_PAGE_IMAGE_CONFIGS,
    HIPPOTHERAPY_PAGE_TEXT,
} from '@/const/admin/hippotherapy-page';
import { useHippotherapyImageField } from '@/hooks/admin/use-hippotherapy-image-field/useHippotherapyImageField';
import { useValidatedRichTextField } from '@/hooks/admin/use-validated-rich-text-field/useValidatedRichTextField';
import { HippotherapyQuoteContent } from '@/types/admin/hippotherapy-page';
import './HippotherapyQuoteSection.scss';

export interface HippotherapyQuoteSectionProps {
    value: HippotherapyQuoteContent;
    onChange: (value: HippotherapyQuoteContent) => void;
    fieldIdPrefix: string;
    defaultImageStyle?: CSSProperties;
    onImageError?: (error: string | null) => void;
    disabled?: boolean;
}

const HippotherapyQuoteSectionComponent = ({
    value,
    onChange,
    fieldIdPrefix,
    defaultImageStyle,
    onImageError,
    disabled,
}: HippotherapyQuoteSectionProps) => {
    const { imageError, handleImageErrorChange, handleImageChange } = useHippotherapyImageField({
        value,
        onChange,
        onImageError,
    });

    const quoteText = useValidatedRichTextField({
        value: value.quoteText,
        onChange: (quoteText) => onChange({ ...value, quoteText }),
    });

    const authorName = useValidatedRichTextField({
        value: value.authorName,
        onChange: (authorName) => onChange({ ...value, authorName }),
        isOptional: true,
    });

    return (
        <div className="hippotherapy-quote-section">
            <div className="hippotherapy-quote-section-image-container">
                <div className="hippotherapy-quote-section-image">
                    <ImageInput
                        variant="whoWeAre"
                        value={value.image}
                        onChange={handleImageChange}
                        setError={handleImageErrorChange}
                        label={COMMON_TEXT_ADMIN.INPUT.ADD_FILE_HERE}
                        subText={COMMON_TEXT_ADMIN.INPUT.getImageSizeSubText(
                            HIPPOTHERAPY_PAGE_IMAGE_CONFIGS.QUOTE.cropHeight,
                            HIPPOTHERAPY_PAGE_IMAGE_CONFIGS.QUOTE.cropWidth,
                        )}
                        cropWidth={HIPPOTHERAPY_PAGE_IMAGE_CONFIGS.QUOTE.cropWidth}
                        cropHeight={HIPPOTHERAPY_PAGE_IMAGE_CONFIGS.QUOTE.cropHeight}
                        minWidth={HIPPOTHERAPY_PAGE_IMAGE_CONFIGS.QUOTE.minWidth}
                        minHeight={HIPPOTHERAPY_PAGE_IMAGE_CONFIGS.QUOTE.minHeight}
                        style={defaultImageStyle}
                        disabled={disabled}
                    />
                </div>
                {imageError && <p className="hippotherapy-quote-section-error">{imageError}</p>}
            </div>
            <div className="hippotherapy-quote-section-fields">
                <RichTextInputGroup
                    label={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                    isRequired
                    id={`${fieldIdPrefix}-quote-text`}
                    name={`${fieldIdPrefix}-quote-text`}
                    value={value.quoteText}
                    onChange={quoteText.handleChange}
                    onBlur={quoteText.handleBlur}
                    maxLength={HIPPOTHERAPY_PAGE_CHAR_LIMITS.QUOTE_TEXT}
                    error={quoteText.error}
                    disabled={disabled}
                />
                <RichTextInputGroup
                    label={HIPPOTHERAPY_PAGE_TEXT.LABEL.ADDITIONAL_DESCRIPTION}
                    id={`${fieldIdPrefix}-quote-author`}
                    name={`${fieldIdPrefix}-quote-author`}
                    value={value.authorName}
                    onChange={authorName.handleChange}
                    onBlur={authorName.handleBlur}
                    maxLength={HIPPOTHERAPY_PAGE_CHAR_LIMITS.QUOTE_AUTHOR}
                    error={authorName.error}
                    disabled={disabled}
                />
            </div>
        </div>
    );
};

export const HippotherapyQuoteSection = memo(HippotherapyQuoteSectionComponent);
