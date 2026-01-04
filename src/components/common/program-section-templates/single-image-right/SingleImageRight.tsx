import cn from 'classnames';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { PhotoInputGroup } from '@/components/admin/input-groups/photo-input-group/PhotoInputGroup';
import { ImageValues } from '@/types/common/image';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { PROGRAMS_TEXT, PROGRAM_SECTION_IMAGE_CONFIGS } from '@/const/admin/programs';
import styles from './SingleImageRight.module.scss';

export interface SingleImageRightProps {
    title?: string;
    description?: string;
    image?: string;
    isTemplate?: boolean;
    isEditable?: boolean;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    onImageChange?: (file: ImageValues | null) => void;
}

export const SingleImageRight = ({
    title = '',
    description = '',
    image = '',
    isTemplate = false,
    isEditable = false,
    onTitleChange,
    onDescriptionChange,
    onImageChange,
}: SingleImageRightProps) => {
    const handleTitleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onTitleChange?.(e.target.value);
    };

    const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onDescriptionChange?.(e.target.value);
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
                                maxLength={60}
                                placeholder={PROGRAMS_TEXT.SECTION.FORM.TITLE.PLACEHOLDER}
                                className={styles['title-input']}
                                rows={2}
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
                                maxLength={600}
                                rows={8}
                            />
                        </div>
                    </div>
                    <div className={styles['right-section']}>
                        <div className={styles['image-wrapper']}>
                            <PhotoInputGroup
                                id="section-image-1"
                                name="section-image-1"
                                value={null}
                                onChange={onImageChange || (() => {})}
                                setError={() => {}}
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
                            <img src={image} alt="" className={styles.image} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
