import { memo, useState } from 'react';
import { ImageInput } from '@/components/admin/image-input/ImageInput';
import { RichTextInputGroup } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import {
    HIPPOTHERAPY_PAGE_CHAR_LIMITS,
    HIPPOTHERAPY_PAGE_DEFAULT_IMAGE_STYLES,
    HIPPOTHERAPY_PAGE_IMAGE_CONFIGS,
} from '@/const/admin/hippotherapy-page';
import { HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS } from '@/validation/admin/hippotherapy-page-schema/HippotherapyPageSchema';
import { getPlainTextFromHtml } from '@/utils/functions/get-plain-text-from-html/get-plain-text-from-html';
import { useHippotherapySectionFields } from '@/hooks/admin/use-hippotherapy-section-fields/useHippotherapySectionFields';
import { HippotherapyEthicsSectionContent } from '@/types/admin/hippotherapy-page';
import './EthicsSection.scss';

export interface EthicsSectionProps {
    value: HippotherapyEthicsSectionContent;
    onChange: (value: HippotherapyEthicsSectionContent) => void;
    onImageError?: (error: string | null) => void;
    disabled?: boolean;
}

const EthicsSectionComponent = ({ value, onChange, onImageError, disabled }: EthicsSectionProps) => {
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
    const [principleErrors, setPrincipleErrors] = useState<Record<number, string | undefined>>({});

    const handlePrincipleChange = (index: number, principle: string) => {
        const principles = value.principles.map((item, itemIndex) => (itemIndex === index ? principle : item));
        onChange({ ...value, principles });

        if (principleErrors[index] !== undefined) {
            setPrincipleErrors((prev) => ({
                ...prev,
                [index]: HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText(getPlainTextFromHtml(principle)),
            }));
        }
    };

    const handlePrincipleBlur = (index: number) => {
        setPrincipleErrors((prev) => ({
            ...prev,
            [index]: HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText(getPlainTextFromHtml(value.principles[index])),
        }));
    };

    return (
        <div className="hippotherapy-ethics-section">
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
                            onChange={handleTitleChange}
                            onBlur={handleTitleBlur}
                            maxLength={HIPPOTHERAPY_PAGE_CHAR_LIMITS.ETHICS_TITLE}
                            error={titleError}
                            disabled={disabled}
                        />
                        <RichTextInputGroup
                            label={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                            isRequired
                            id="hippotherapy-ethics-description"
                            name="hippotherapy-ethics-description"
                            value={value.description}
                            onChange={handleDescriptionChange}
                            onBlur={handleDescriptionBlur}
                            maxLength={HIPPOTHERAPY_PAGE_CHAR_LIMITS.ETHICS_DESCRIPTION}
                            error={descriptionError}
                            disabled={disabled}
                        />
                    </div>
                    <div className="hippotherapy-ethics-section-principles">
                        {value.principles.map((principle, index) => (
                            <div key={index} className="hippotherapy-ethics-section-principle">
                                <RichTextInputGroup
                                    label={COMMON_TEXT_ADMIN.TYPE.DESCRIPTION}
                                    isRequired
                                    id={`hippotherapy-ethics-principle-${index}`}
                                    name={`hippotherapy-ethics-principle-${index}`}
                                    value={principle}
                                    onChange={(nextValue) => handlePrincipleChange(index, nextValue)}
                                    onBlur={() => handlePrincipleBlur(index)}
                                    maxLength={HIPPOTHERAPY_PAGE_CHAR_LIMITS.ETHICS_PRINCIPLE}
                                    error={principleErrors[index]}
                                    disabled={disabled}
                                />
                            </div>
                        ))}
                    </div>
                </div>
                {imageError && <p className="hippotherapy-ethics-section-error">{imageError}</p>}
            </div>
        </div>
    );
};

export const EthicsSection = memo(EthicsSectionComponent);
