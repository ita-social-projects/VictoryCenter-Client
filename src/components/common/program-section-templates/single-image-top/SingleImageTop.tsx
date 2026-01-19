import cn from 'classnames';
import { TitleDescriptionSection } from '../shared/title-description-section/TitleDescriptionSection';
import { PhotoInputGroup } from '@/components/admin/input-groups/photo-input-group/PhotoInputGroup';
import { ImageValues } from '@/types/common/image';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { PROGRAM_SECTION_IMAGE_CONFIGS, PROGRAM_VALIDATION } from '@/const/admin/programs';
import styles from './SingleImageTop.module.scss';

export interface SingleImageTopProps {
    title?: string;
    description?: string;
    image?: string;
    isTemplate?: boolean;
    isEditable?: boolean;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    onImageChange?: (file: ImageValues | null) => void;
}

export const SingleImageTop = ({
    title = '',
    description = '',
    image = '',
    isTemplate = false,
    isEditable = false,
    onTitleChange,
    onDescriptionChange,
    onImageChange,
}: SingleImageTopProps) => {
    return (
        <div
            className={cn(styles.container, {
                [styles.template]: isTemplate,
                [styles.editable]: isEditable,
            })}
        >
            <div className={styles['top-section']}>
                <div className={styles['image-wrapper']}>
                    {isEditable ? (
                        <PhotoInputGroup
                            id="section-image-1"
                            name="section-image-1"
                            value={null}
                            onChange={onImageChange || (() => {})}
                            setError={() => {}}
                            cropWidth={PROGRAM_SECTION_IMAGE_CONFIGS.SINGLE_IMAGE_TOP.cropWidth}
                            cropHeight={PROGRAM_SECTION_IMAGE_CONFIGS.SINGLE_IMAGE_TOP.cropHeight}
                            minWidth={PROGRAM_SECTION_IMAGE_CONFIGS.SINGLE_IMAGE_TOP.minWidth}
                            minHeight={PROGRAM_SECTION_IMAGE_CONFIGS.SINGLE_IMAGE_TOP.minHeight}
                            imageLabel={COMMON_TEXT_ADMIN.INPUT.DRAG_AND_DROP_FILE_HERE}
                            imageSubText={COMMON_TEXT_ADMIN.INPUT.getImageSizeSubText(
                                PROGRAM_SECTION_IMAGE_CONFIGS.SINGLE_IMAGE_TOP.cropHeight,
                                PROGRAM_SECTION_IMAGE_CONFIGS.SINGLE_IMAGE_TOP.cropWidth,
                            )}
                            variant="programSection"
                            maxSizeMB={PROGRAM_VALIDATION.images.maxSizeMB}
                        />
                    ) : (
                        <img src={image || undefined} alt="" className={styles.image} />
                    )}
                </div>
            </div>
            <TitleDescriptionSection
                title={title}
                description={description}
                className={styles['bottom-section']}
                titleClassName={isTemplate ? styles['title-template'] : ''}
                descriptionClassName={isTemplate ? styles['description-template'] : ''}
                isTemplate={isTemplate}
                isEditable={isEditable}
                onTitleChange={onTitleChange}
                onDescriptionChange={onDescriptionChange}
            />
        </div>
    );
};
