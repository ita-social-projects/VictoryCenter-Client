import { memo } from 'react';
import { EthicsPrinciple } from './ethics-principle/EthicsPrinciple';
import { ImageInput } from '@/components/admin/image-input/ImageInput';
import { RichTextInputGroup } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import {
    HIPPOTHERAPY_PAGE_CHAR_LIMITS,
    HIPPOTHERAPY_PAGE_DEFAULT_IMAGE_STYLES,
    HIPPOTHERAPY_PAGE_IMAGE_CONFIGS,
    HIPPOTHERAPY_PAGE_TEXT,
} from '@/const/admin/hippotherapy-page';
import { useValidatedRichTextField } from '@/hooks/admin/use-validated-rich-text-field/useValidatedRichTextField';
import { useHippotherapyImageField } from '@/hooks/admin/use-hippotherapy-image-field/useHippotherapyImageField';
import { HippotherapyEthicsSectionContent } from '@/types/admin/hippotherapy-page';
import './EthicsSection.scss';

export interface EthicsSectionProps {
    value: HippotherapyEthicsSectionContent;
    onChange: (value: HippotherapyEthicsSectionContent) => void;
    onImageError?: (error: string | null) => void;
    disabled?: boolean;
}

const EthicsSectionComponent = ({ value, onChange, onImageError, disabled }: EthicsSectionProps) => {
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

    const description = useValidatedRichTextField({
        value: value.description,
        onChange: (description) => onChange({ ...value, description }),
    });

    const handlePrincipleChange = (index: number, principle: string) => {
        const principles = value.principles.map((item, itemIndex) => (itemIndex === index ? principle : item));
        onChange({ ...value, principles });
    };

    return (
        <div className="hippotherapy-ethics-section">
            <div className="hippotherapy-ethics-section-image-container">
                <div className="hippotherapy-ethics-section-image">
                    <ImageInput
                        variant="whoWeAre"
                        value={value.image}
                        onChange={handleImageChange}
                        setError={handleImageErrorChange}
                        label={COMMON_TEXT_ADMIN.INPUT.ADD_FILE_HERE}
                        subText={COMMON_TEXT_ADMIN.INPUT.getImageSizeSubText(
                            HIPPOTHERAPY_PAGE_IMAGE_CONFIGS.ETHICS.cropHeight,
                            HIPPOTHERAPY_PAGE_IMAGE_CONFIGS.ETHICS.cropWidth,
                        )}
                        cropWidth={HIPPOTHERAPY_PAGE_IMAGE_CONFIGS.ETHICS.cropWidth}
                        cropHeight={HIPPOTHERAPY_PAGE_IMAGE_CONFIGS.ETHICS.cropHeight}
                        minWidth={HIPPOTHERAPY_PAGE_IMAGE_CONFIGS.ETHICS.minWidth}
                        minHeight={HIPPOTHERAPY_PAGE_IMAGE_CONFIGS.ETHICS.minHeight}
                        style={HIPPOTHERAPY_PAGE_DEFAULT_IMAGE_STYLES.ETHICS}
                        disabled={disabled}
                    />
                    <div className="hippotherapy-ethics-section-overlay">
                        <div className="hippotherapy-ethics-section-summary">
                            <RichTextInputGroup
                                label={COMMON_TEXT_ADMIN.TYPE.TITLE}
                                isRequired
                                id="hippotherapy-ethics-title"
                                name="hippotherapy-ethics-title"
                                value={value.title}
                                onChange={title.handleChange}
                                onBlur={title.handleBlur}
                                maxLength={HIPPOTHERAPY_PAGE_CHAR_LIMITS.ETHICS_TITLE}
                                error={title.error}
                                disabled={disabled}
                            />
                            <RichTextInputGroup
                                label={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                                isRequired
                                id="hippotherapy-ethics-description"
                                name="hippotherapy-ethics-description"
                                value={value.description}
                                onChange={description.handleChange}
                                onBlur={description.handleBlur}
                                maxLength={HIPPOTHERAPY_PAGE_CHAR_LIMITS.ETHICS_DESCRIPTION}
                                error={description.error}
                                disabled={disabled}
                            />
                        </div>
                        <div className="hippotherapy-ethics-section-principles">
                            {value.principles.map((principle, index) => (
                                <EthicsPrinciple
                                    key={index}
                                    value={principle}
                                    fieldId={`hippotherapy-ethics-principle-${index}`}
                                    onChange={(nextValue) => handlePrincipleChange(index, nextValue)}
                                    disabled={disabled}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                {imageError && <p className="hippotherapy-ethics-section-error">{imageError}</p>}
            </div>
        </div>
    );
};

export const EthicsSection = memo(EthicsSectionComponent);
