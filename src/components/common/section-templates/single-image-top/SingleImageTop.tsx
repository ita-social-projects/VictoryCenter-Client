import cn from 'classnames';
import { TitleDescriptionSection } from '../shared/title-description-section/TitleDescriptionSection';
import { PhotoInputGroup } from '@/components/admin/input-groups/photo-input-group/PhotoInputGroup';
import { ImageValues, Image } from '@/types/common/image';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { PROGRAM_SECTION_IMAGE_CONFIGS, PROGRAM_VALIDATION } from '@/const/admin/programs';
import { getImageSrc } from '@/utils/functions/image-helper/image-helper';
import { SectionMode, SectionTemplate } from '@/types/common/sections';
import { useImageError } from '@/hooks/common/use-image-error/useImageError';
import styles from './SingleImageTop.module.scss';
import viewStyles from './ViewSingleImageTop.module.scss';

export interface SingleImageTopProps {
    title?: string;
    description?: string;
    image?: Image | ImageValues | null;
    mode?: SectionMode;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    onImageChange?: (file: ImageValues | null) => void;
    validationResetKey?: number;
}

export const SingleImageTop = ({
    title = '',
    description = '',
    image = null,
    mode = SectionMode.View,
    onTitleChange,
    onDescriptionChange,
    onImageChange,
    validationResetKey,
}: SingleImageTopProps) => {
    const imageSrc = getImageSrc(image);
    const baseStyles = mode === SectionMode.View ? viewStyles : styles;
    const { error, handleSetError } = useImageError();

    return (
        <div
            className={cn(baseStyles.container, {
                [styles.template]: mode === SectionMode.Template,
                [styles['form-container']]: mode === SectionMode.Edit,
            })}
        >
            <div className={baseStyles['top-section']}>
                <div className={baseStyles['image-wrapper']}>
                    {mode === SectionMode.Edit ? (
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
                        />
                    ) : (
                        imageSrc && <img src={imageSrc} alt="" className={baseStyles.image} loading="lazy" />
                    )}
                </div>
            </div>

            <TitleDescriptionSection
                template={SectionTemplate.SingleImageTop}
                title={title}
                description={description}
                className={baseStyles['bottom-section']}
                titleClassName={mode === SectionMode.Template ? styles['title-template'] : ''}
                descriptionClassName={mode === SectionMode.Template ? styles['description-template'] : ''}
                mode={mode}
                onTitleChange={onTitleChange}
                onDescriptionChange={onDescriptionChange}
                validationResetKey={validationResetKey}
            />
        </div>
    );
};
