import cn from 'classnames';
import { TitleDescriptionSection } from '../shared/title-description-section/TitleDescriptionSection';
import { PhotoInputGroup } from '@/components/admin/input-groups/photo-input-group/PhotoInputGroup';
import { ImageValues, Image } from '@/types/common/image';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { PROGRAM_SECTION_IMAGE_CONFIGS, PROGRAM_VALIDATION } from '@/const/admin/programs';
import { getImageSrc } from '@/utils/functions/image-helper/image-helper';
import { ProgramSectionMode } from '@/types/common/program-sections';
import styles from './SingleImageTop.module.scss';
import { useState } from 'react';

export interface SingleImageTopProps {
    title?: string;
    description?: string;
    image?: Image | ImageValues | null;
    mode?: ProgramSectionMode;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    onImageChange?: (file: ImageValues | null) => void;
}

export const SingleImageTop = ({
    title = '',
    description = '',
    image = null,
    mode = ProgramSectionMode.Published,
    onTitleChange,
    onDescriptionChange,
    onImageChange,
}: SingleImageTopProps) => {
    const imageSrc = getImageSrc(image);
    const [error, setError] = useState<string>('');

    const handleSetError = (errorMessage: string | null) => {
        setError(errorMessage || '');
    };

    return (
        <div
            className={cn(styles.container, {
                [styles.template]: mode === ProgramSectionMode.Template,
                [styles['form-container']]: mode === ProgramSectionMode.Edit || mode === ProgramSectionMode.View,
            })}
        >
            <div className={styles['top-section']}>
                <div className={styles['image-wrapper']}>
                    {mode === ProgramSectionMode.Edit || mode === ProgramSectionMode.View ? (
                        <PhotoInputGroup
                            id="section-image-1"
                            name="section-image-1"
                            value={image}
                            onChange={onImageChange || (() => {})}
                            setError={handleSetError}
                            error={error}
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
                            disabled={mode === ProgramSectionMode.View}
                        />
                    ) : (
                        imageSrc && <img src={imageSrc} alt="" className={styles.image} />
                    )}
                </div>
            </div>
            <TitleDescriptionSection
                title={title}
                description={description}
                className={styles['bottom-section']}
                titleClassName={mode === ProgramSectionMode.Template ? styles['title-template'] : ''}
                descriptionClassName={mode === ProgramSectionMode.Template ? styles['description-template'] : ''}
                mode={mode}
                onTitleChange={onTitleChange}
                onDescriptionChange={onDescriptionChange}
            />
        </div>
    );
};
