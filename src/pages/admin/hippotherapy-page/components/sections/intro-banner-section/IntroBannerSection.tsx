import { memo } from 'react';
import { ImageInput } from '@/components/admin/image-input/ImageInput';
import { RichTextInputGroup } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import {
    HIPPOTHERAPY_PAGE_CHAR_LIMITS,
    HIPPOTHERAPY_PAGE_DEFAULT_IMAGE_STYLES,
    HIPPOTHERAPY_PAGE_IMAGE_CONFIGS,
} from '@/const/admin/hippotherapy-page';
import { useHippotherapySectionFields } from '@/hooks/admin/use-hippotherapy-section-fields/useHippotherapySectionFields';
import { HippotherapyIntroSectionContent } from '@/types/admin/hippotherapy-page';
import './IntroBannerSection.scss';

export interface IntroBannerSectionProps {
    value: HippotherapyIntroSectionContent;
    onChange: (value: HippotherapyIntroSectionContent) => void;
    onImageError?: (error: string | null) => void;
    disabled?: boolean;
}

const IntroBannerSectionComponent = ({ value, onChange, onImageError, disabled }: IntroBannerSectionProps) => {
    const {
        imageError,
        titleError,
        descriptionError,
        handleImageErrorChange,
        handleImageChange,
        handleTitleChange,
        handleTitleBlur,
        handleDescriptionChange,
        handleDescriptionBlur,
    } = useHippotherapySectionFields({ value, onChange, onImageError });

    return (
        <div className="hippotherapy-intro-banner-section">
            <div className="hippotherapy-intro-banner-section-image">
                <ImageInput
                    variant="whoWeAre"
                    value={value.image}
                    onChange={handleImageChange}
                    setError={handleImageErrorChange}
                    label={COMMON_TEXT_ADMIN.INPUT.ADD_FILE_HERE}
                    subText={COMMON_TEXT_ADMIN.INPUT.getImageSizeSubText(
                        HIPPOTHERAPY_PAGE_IMAGE_CONFIGS.INTRO.cropHeight,
                        HIPPOTHERAPY_PAGE_IMAGE_CONFIGS.INTRO.cropWidth,
                    )}
                    cropWidth={HIPPOTHERAPY_PAGE_IMAGE_CONFIGS.INTRO.cropWidth}
                    cropHeight={HIPPOTHERAPY_PAGE_IMAGE_CONFIGS.INTRO.cropHeight}
                    minWidth={HIPPOTHERAPY_PAGE_IMAGE_CONFIGS.INTRO.minWidth}
                    minHeight={HIPPOTHERAPY_PAGE_IMAGE_CONFIGS.INTRO.minHeight}
                    style={HIPPOTHERAPY_PAGE_DEFAULT_IMAGE_STYLES.INTRO}
                    disabled={disabled}
                />
                {imageError && <p className="hippotherapy-intro-banner-section-error">{imageError}</p>}
            </div>
            <div className="hippotherapy-intro-banner-section-fields">
                <RichTextInputGroup
                    label={COMMON_TEXT_ADMIN.TYPE.TITLE}
                    isRequired
                    id="hippotherapy-intro-title"
                    name="hippotherapy-intro-title"
                    value={value.title}
                    onChange={handleTitleChange}
                    onBlur={handleTitleBlur}
                    maxLength={HIPPOTHERAPY_PAGE_CHAR_LIMITS.INTRO_TITLE}
                    error={titleError}
                    disabled={disabled}
                />
                <RichTextInputGroup
                    label={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                    isRequired
                    id="hippotherapy-intro-description"
                    name="hippotherapy-intro-description"
                    value={value.description}
                    onChange={handleDescriptionChange}
                    onBlur={handleDescriptionBlur}
                    maxLength={HIPPOTHERAPY_PAGE_CHAR_LIMITS.INTRO_DESCRIPTION}
                    error={descriptionError}
                    disabled={disabled}
                />
            </div>
        </div>
    );
};

export const IntroBannerSection = memo(IntroBannerSectionComponent);
