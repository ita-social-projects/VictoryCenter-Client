import { memo } from 'react';
import { ImageInput } from '@/components/admin/image-input/ImageInput';
import { RichTextInputGroup } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import {
    HIPPOTHERAPY_PAGE_CHAR_LIMITS,
    HIPPOTHERAPY_PAGE_DEFAULT_IMAGE_STYLES,
    HIPPOTHERAPY_PAGE_IMAGE_CONFIGS,
    HIPPOTHERAPY_PAGE_TEXT,
} from '@/const/admin/hippotherapy-page';
import { useHippotherapyImageField } from '@/hooks/admin/use-hippotherapy-image-field/useHippotherapyImageField';
import { useValidatedRichTextField } from '@/hooks/admin/use-validated-rich-text-field/useValidatedRichTextField';
import { HippoventionCenterSectionContent } from '@/types/admin/hippotherapy-page';
import './HippoventionCenterSection.scss';

export interface HippoventionCenterSectionProps {
    value: HippoventionCenterSectionContent;
    onChange: (value: HippoventionCenterSectionContent) => void;
    onImageError?: (error: string | null) => void;
    disabled?: boolean;
}

const HippoventionCenterSectionComponent = ({
    value,
    onChange,
    onImageError,
    disabled,
}: HippoventionCenterSectionProps) => {
    const { imageError, handleImageErrorChange, handleImageChange } = useHippotherapyImageField({
        value,
        onChange,
        onImageError,
    });

    const title = useValidatedRichTextField({
        value: value.title,
        onChange: (title) => onChange({ ...value, title }),
        minLength: HIPPOTHERAPY_PAGE_TEXT.MIN_TITLE_LENGTH,
    });

    const pros = useValidatedRichTextField({
        value: value.pros,
        onChange: (pros) => onChange({ ...value, pros }),
    });

    const description = useValidatedRichTextField({
        value: value.description,
        onChange: (description) => onChange({ ...value, description }),
        isOptional: true,
    });

    return (
        <div className="hippovention-center-section">
            <div className="hippovention-center-section-image-container">
                <div className="hippovention-center-section-image">
                    <ImageInput
                        variant="whoWeAre"
                        value={value.image}
                        onChange={handleImageChange}
                        setError={handleImageErrorChange}
                        label={COMMON_TEXT_ADMIN.INPUT.ADD_FILE_HERE}
                        subText={COMMON_TEXT_ADMIN.INPUT.getImageSizeSubText(
                            HIPPOTHERAPY_PAGE_IMAGE_CONFIGS.HIPPOVENTION_CENTER.cropHeight,
                            HIPPOTHERAPY_PAGE_IMAGE_CONFIGS.HIPPOVENTION_CENTER.cropWidth,
                        )}
                        cropWidth={HIPPOTHERAPY_PAGE_IMAGE_CONFIGS.HIPPOVENTION_CENTER.cropWidth}
                        cropHeight={HIPPOTHERAPY_PAGE_IMAGE_CONFIGS.HIPPOVENTION_CENTER.cropHeight}
                        minWidth={HIPPOTHERAPY_PAGE_IMAGE_CONFIGS.HIPPOVENTION_CENTER.minWidth}
                        minHeight={HIPPOTHERAPY_PAGE_IMAGE_CONFIGS.HIPPOVENTION_CENTER.minHeight}
                        style={HIPPOTHERAPY_PAGE_DEFAULT_IMAGE_STYLES.HIPPOVENTION_CENTER}
                        disabled={disabled}
                    />

                    <div className="hippovention-center-section-overlay hippovention-center-section-overlay--top">
                        <RichTextInputGroup
                            className="hippovention-center-section-title"
                            label={COMMON_TEXT_ADMIN.TYPE.TITLE}
                            isRequired
                            id="hippovention-center-title"
                            name="hippovention-center-title"
                            value={value.title}
                            onChange={title.handleChange}
                            onBlur={title.handleBlur}
                            maxLength={HIPPOTHERAPY_PAGE_CHAR_LIMITS.HIPPOVENTION_CENTER_TITLE}
                            error={title.error}
                            disabled={disabled}
                        />
                    </div>

                    <div className="hippovention-center-section-overlay hippovention-center-section-overlay--bottom">
                        <RichTextInputGroup
                            className="hippovention-center-section-pros"
                            label={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                            isRequired
                            id="hippovention-center-pros"
                            name="hippovention-center-pros"
                            value={value.pros}
                            onChange={pros.handleChange}
                            onBlur={pros.handleBlur}
                            maxLength={HIPPOTHERAPY_PAGE_CHAR_LIMITS.HIPPOVENTION_CENTER_PROS}
                            error={pros.error}
                            disabled={disabled}
                        />
                        <RichTextInputGroup
                            className="hippovention-center-section-description"
                            label={HIPPOTHERAPY_PAGE_TEXT.LABEL.ADDITIONAL_DESCRIPTION}
                            id="hippovention-center-description"
                            name="hippovention-center-description"
                            value={value.description}
                            onChange={description.handleChange}
                            onBlur={description.handleBlur}
                            maxLength={HIPPOTHERAPY_PAGE_CHAR_LIMITS.HIPPOVENTION_CENTER_DESCRIPTION}
                            error={description.error}
                            disabled={disabled}
                        />
                    </div>
                </div>
                {imageError && <p className="hippovention-center-section-error">{imageError}</p>}
            </div>
        </div>
    );
};

export const HippoventionCenterSection = memo(HippoventionCenterSectionComponent);
