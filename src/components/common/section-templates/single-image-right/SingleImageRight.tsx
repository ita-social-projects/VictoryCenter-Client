import cn from 'classnames';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { PhotoInputGroup } from '@/components/admin/input-groups/photo-input-group/PhotoInputGroup';
import { ImageValues, Image } from '@/types/common/image';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { getImageSrc } from '@/utils/functions/image-helper/image-helper';
import { PROGRAMS_TEXT, PROGRAM_SECTION_IMAGE_CONFIGS, PROGRAM_VALIDATION } from '@/const/admin/programs';
import { useProgramSectionValidation } from '@/hooks/admin/use-program-section-validation';
import { getTrimmedInputText } from '@/utils/functions/formatters/text-formatters';
import { SectionMode, SectionTemplate } from '@/types/common/program-sections';
import { ContentType } from '@/types/common/programs';
import { useImageError } from '@/hooks/common/use-image-error/useImageError';
import { getProgramSectionTemplateMaxLength } from '@/utils/functions/program-section-template-validation/programSectionTemplateValidation';
import styles from './SingleImageRight.module.scss';
import viewStyles from './ViewSingleImageRight.module.scss';

export interface SingleImageRightProps {
    title?: string;
    description?: string;
    image?: Image | ImageValues | null;
    mode?: SectionMode;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    onImageChange?: (file: ImageValues | null) => void;
    validationResetKey?: number;
}

const TEMPLATE = SectionTemplate.SingleImageRight;

export const SingleImageRight = ({
    title = '',
    description = '',
    image = null,
    mode = SectionMode.View,
    onTitleChange,
    onDescriptionChange,
    onImageChange,
    validationResetKey,
}: SingleImageRightProps) => {
    const imageSrc = getImageSrc(image);
    const baseStyles = mode === SectionMode.View ? viewStyles : styles;

    const {
        titleError,
        descriptionError,
        handleTitleChange,
        handleTitleBlur,
        handleDescriptionChange,
        handleDescriptionBlur,
    } = useProgramSectionValidation({
        template: TEMPLATE,
        onTitleChange,
        onDescriptionChange,
        resetKey: validationResetKey,
    });

    const { error, handleSetError } = useImageError();

    const titleMaxLength = getProgramSectionTemplateMaxLength(TEMPLATE, ContentType.Title);
    const descriptionMaxLength = getProgramSectionTemplateMaxLength(TEMPLATE, ContentType.Description);

    return (
        <div
            className={cn(baseStyles.container, {
                [styles.template]: mode === SectionMode.Template,
                [styles['form-container']]: mode === SectionMode.Edit,
            })}
        >
            {mode === SectionMode.Edit ? (
                <>
                    <div className={baseStyles['left-section']}>
                        <div className={baseStyles['title-section']}>
                            <TextAreaWithCharacterLimitGroup
                                label={PROGRAMS_TEXT.SECTION.FORM.TITLE.TEXT}
                                isRequired={true}
                                id="section-title"
                                name="section-title"
                                value={title}
                                onChange={handleTitleChange}
                                onBlur={handleTitleBlur}
                                maxLength={titleMaxLength}
                                placeholder={PROGRAMS_TEXT.SECTION.FORM.TITLE.PLACEHOLDER}
                                className={styles['title-input']}
                                rows={2}
                                autoGrow={true}
                                maxRows={8}
                                error={titleError}
                                currentLength={getTrimmedInputText(title).length}
                                maxLimitWarning={COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(titleMaxLength)}
                            />
                        </div>
                        <div className={baseStyles['description-section']}>
                            <TextAreaWithCharacterLimitGroup
                                label={PROGRAMS_TEXT.SECTION.FORM.DESCRIPTION.TEXT}
                                isRequired={true}
                                id="section-description"
                                name="section-description"
                                value={description}
                                onChange={handleDescriptionChange}
                                onBlur={handleDescriptionBlur}
                                maxLength={descriptionMaxLength}
                                rows={8}
                                error={descriptionError}
                                currentLength={getTrimmedInputText(description).length}
                                maxLimitWarning={COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(descriptionMaxLength)}
                            />
                        </div>
                    </div>
                    <div className={baseStyles['right-section']}>
                        <div className={baseStyles['image-wrapper']}>
                            <PhotoInputGroup
                                id="section-image-1"
                                name="section-image-1"
                                value={image}
                                onChange={onImageChange || (() => {})}
                                setError={handleSetError}
                                error={error}
                                cropWidth={PROGRAM_SECTION_IMAGE_CONFIGS.SINGLE_IMAGE_RIGHT.cropWidth}
                                cropHeight={PROGRAM_SECTION_IMAGE_CONFIGS.SINGLE_IMAGE_RIGHT.cropHeight}
                                minWidth={PROGRAM_SECTION_IMAGE_CONFIGS.SINGLE_IMAGE_RIGHT.minWidth}
                                minHeight={PROGRAM_SECTION_IMAGE_CONFIGS.SINGLE_IMAGE_RIGHT.minHeight}
                                imageLabel={COMMON_TEXT_ADMIN.INPUT.DRAG_AND_DROP_FILE_HERE}
                                imageSubText={COMMON_TEXT_ADMIN.INPUT.getImageSizeSubText(
                                    PROGRAM_SECTION_IMAGE_CONFIGS.SINGLE_IMAGE_RIGHT.cropHeight,
                                    PROGRAM_SECTION_IMAGE_CONFIGS.SINGLE_IMAGE_RIGHT.cropWidth,
                                )}
                                variant="programSection"
                                maxSizeMB={PROGRAM_VALIDATION.images.maxSizeMB}
                            />
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <div className={baseStyles['left-section']}>
                        <div className={baseStyles['title-section']}>
                            <h2 className={baseStyles.title}>{title}</h2>
                        </div>
                        <div className={baseStyles['description-section']}>
                            <p className={baseStyles.description}>{description}</p>
                        </div>
                    </div>
                    <div className={baseStyles['right-section']}>
                        <div className={baseStyles['image-wrapper']}>
                            {imageSrc && <img src={imageSrc} alt="" className={baseStyles.image} loading="lazy" />}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
