import { CSSProperties, memo, useState } from 'react';
import { ImageInput } from '@/components/admin/image-input/ImageInput';
import { RichTextInputGroup } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import {
    HIPPOTHERAPY_PAGE_CHAR_LIMITS,
    HIPPOTHERAPY_PAGE_IMAGE_CONFIGS,
    HIPPOTHERAPY_PAGE_TEXT,
} from '@/const/admin/hippotherapy-page';
import { HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS } from '@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema';
import { getPlainTextFromHtml } from '@/utils/functions/get-plain-text-from-html/get-plain-text-from-html';
import { HippotherapyQuoteContent } from '@/types/admin/hippotherapy-page';
import { ImageValues } from '@/types/common/image';
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
    const [imageError, setImageError] = useState<string | null>(null);
    const [quoteTextError, setQuoteTextError] = useState<string | undefined>();
    const [authorNameError, setAuthorNameError] = useState<string | undefined>();

    const handleImageErrorChange = (error: string | null) => {
        setImageError(error);
        onImageError?.(error);
    };

    const handleImageChange = (image: ImageValues | null) => {
        onChange({ ...value, image });
    };

    const handleQuoteTextChange = (quoteText: string) => {
        onChange({ ...value, quoteText });
        setQuoteTextError(HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText(getPlainTextFromHtml(quoteText)));
    };

    const handleAuthorNameChange = (authorName: string) => {
        onChange({ ...value, authorName });
        setAuthorNameError(HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText(getPlainTextFromHtml(authorName)));
    };

    return (
        <div className="hippotherapy-quote-section">
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
                {imageError && <p className="hippotherapy-quote-section-error">{imageError}</p>}
            </div>
            <div className="hippotherapy-quote-section-fields">
                <RichTextInputGroup
                    label={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                    isRequired
                    id={`${fieldIdPrefix}-quote-text`}
                    name={`${fieldIdPrefix}-quote-text`}
                    value={value.quoteText}
                    onChange={handleQuoteTextChange}
                    maxLength={HIPPOTHERAPY_PAGE_CHAR_LIMITS.QUOTE_TEXT}
                    error={quoteTextError}
                    disabled={disabled}
                />
                <RichTextInputGroup
                    label={HIPPOTHERAPY_PAGE_TEXT.LABEL.ADDITIONAL_DESCRIPTION}
                    isRequired
                    id={`${fieldIdPrefix}-quote-author`}
                    name={`${fieldIdPrefix}-quote-author`}
                    value={value.authorName}
                    onChange={handleAuthorNameChange}
                    maxLength={HIPPOTHERAPY_PAGE_CHAR_LIMITS.QUOTE_AUTHOR}
                    error={authorNameError}
                    disabled={disabled}
                />
            </div>
        </div>
    );
};

export const HippotherapyQuoteSection = memo(HippotherapyQuoteSectionComponent);
