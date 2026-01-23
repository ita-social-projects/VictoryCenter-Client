import cn from 'classnames';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { PhotoInputGroup } from '@/components/admin/input-groups/photo-input-group/PhotoInputGroup';
import { ImageValues, Image } from '@/types/common/image';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { getImageSrc } from '@/utils/functions/image-helper/image-helper';
import {
    PROGRAMS_TEXT,
    PROGRAM_SECTION_IMAGE_CONFIGS,
    PROGRAM_SECTION_VALIDATION,
    PROGRAM_VALIDATION,
} from '@/const/admin/programs';
import { useProgramSectionValidation } from '@/hooks/admin/use-program-section-validation';
import { getTrimmedInputText } from '@/utils/functions/formatters/text-formatters';
import styles from './SingleImageRight.module.scss';
import { error } from 'console';
import { useState } from 'react';

export interface SingleImageRightProps {
    title?: string;
    description?: string;
    image?: Image | ImageValues | null;
    isTemplate?: boolean;
    isEditable?: boolean;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    onImageChange?: (file: ImageValues | null) => void;
}

export const SingleImageRight = ({
    title = '',
    description = '',
    image = null,
    isTemplate = false,
    isEditable = false,
    onTitleChange,
    onDescriptionChange,
    onImageChange,
}: SingleImageRightProps) => {
    const imageSrc = getImageSrc(image);
    const {
        titleError,
        descriptionError,
        handleTitleChange,
        handleTitleBlur,
        handleDescriptionChange,
        handleDescriptionBlur,
    } = useProgramSectionValidation({
        onTitleChange,
        onDescriptionChange,
    });

    const [error, setError] = useState<string>('');

    const handleSetError = (errorMessage: string | null) => {
        setError(errorMessage || '');
    };

    return (
        <div
            className={cn(styles.container, {
                [styles.template]: isTemplate,
                [styles.editable]: isEditable,
            })}
        >
            {isEditable ? (
                <>
                    <div className={styles['left-section']}>
                        <div className={styles['title-section']}>
                            <TextAreaWithCharacterLimitGroup
                                label={PROGRAMS_TEXT.SECTION.FORM.TITLE.TEXT}
                                isRequired={true}
                                id="section-title"
                                name="section-title"
                                value={title}
                                onChange={handleTitleChange}
                                onBlur={handleTitleBlur}
                                maxLength={PROGRAM_SECTION_VALIDATION.title.max}
                                placeholder={PROGRAMS_TEXT.SECTION.FORM.TITLE.PLACEHOLDER}
                                className={styles['title-input']}
                                rows={2}
                                error={titleError}
                                currentLength={getTrimmedInputText(title).length}
                            />
                        </div>
                        <div className={styles['description-section']}>
                            <TextAreaWithCharacterLimitGroup
                                label={PROGRAMS_TEXT.SECTION.FORM.DESCRIPTION.TEXT}
                                isRequired={true}
                                id="section-description"
                                name="section-description"
                                value={description}
                                onChange={handleDescriptionChange}
                                onBlur={handleDescriptionBlur}
                                maxLength={PROGRAM_SECTION_VALIDATION.description.max}
                                rows={8}
                                error={descriptionError}
                                currentLength={getTrimmedInputText(description).length}
                            />
                        </div>
                    </div>
                    <div className={styles['right-section']}>
                        <div className={styles['image-wrapper']}>
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
                    <div className={styles['left-section']}>
                        <div className={styles['title-section']}>
                            <h2 className={styles.title}>{title}</h2>
                        </div>
                        <div className={styles['description-section']}>
                            <p className={styles.description}>{description}</p>
                        </div>
                    </div>
                    <div className={styles['right-section']}>
                        <div className={styles['image-wrapper']}>
                            {imageSrc && <img src={imageSrc} alt="" className={styles.image} />}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
