import cn from 'classnames';
import { TitleDescriptionSection } from '../shared/title-description-section/TitleDescriptionSection';
import { PhotoInputGroup } from '@/components/admin/input-groups/photo-input-group/PhotoInputGroup';
import { ImageValues, Image } from '@/types/common/image';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { PROGRAM_SECTION_IMAGE_CONFIGS, PROGRAM_VALIDATION } from '@/const/admin/programs';
import { getImageSrc } from '@/utils/functions/image-helper/image-helper';
import { ProgramSectionMode, ProgramSectionTemplate } from '@/types/common/program-sections';
import { useImageError } from '@/hooks/common/use-image-error/useImageError';
import styles from './SingleImageBottom.module.scss';
import publishedStyles from './PublishedSingleImageBottom.module.scss';

export interface SingleImageBottomProps {
    title?: string;
    description?: string;
    image?: Image | ImageValues | null;
    mode?: ProgramSectionMode;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    onImageChange?: (file: ImageValues | null) => void;
    validationResetKey?: number;
}

export const SingleImageBottom = ({
    title = '',
    description = '',
    image = null,
    mode = ProgramSectionMode.Published,
    onTitleChange,
    onDescriptionChange,
    onImageChange,
    validationResetKey,
}: SingleImageBottomProps) => {
    const imageSrc = getImageSrc(image);
    const baseStyles = mode === ProgramSectionMode.Published ? publishedStyles : styles;
    const { error, handleSetError } = useImageError();

    return (
        <div
            className={cn(baseStyles.container, {
                [styles.template]: mode === ProgramSectionMode.Template,
                [styles['form-container']]: mode === ProgramSectionMode.Edit || mode === ProgramSectionMode.View,
            })}
        >
            <TitleDescriptionSection
                template={ProgramSectionTemplate.SingleImageBottom}
                title={title}
                description={description}
                className={baseStyles['top-section']}
                titleClassName={mode === ProgramSectionMode.Template ? styles['title-template'] : ''}
                descriptionClassName={mode === ProgramSectionMode.Template ? styles['description-template'] : ''}
                mode={mode}
                onTitleChange={onTitleChange}
                onDescriptionChange={onDescriptionChange}
                validationResetKey={validationResetKey}
            />
            <div className={baseStyles['bottom-section']}>
                <div className={baseStyles['image-wrapper']}>
                    {mode === ProgramSectionMode.Edit || mode === ProgramSectionMode.View ? (
                        <PhotoInputGroup
                            id="section-image-1"
                            name="section-image-1"
                            value={image}
                            onChange={onImageChange || (() => {})}
                            setError={handleSetError}
                            error={error}
                            cropWidth={PROGRAM_SECTION_IMAGE_CONFIGS.SINGLE_IMAGE_BOTTOM.cropWidth}
                            cropHeight={PROGRAM_SECTION_IMAGE_CONFIGS.SINGLE_IMAGE_BOTTOM.cropHeight}
                            minWidth={PROGRAM_SECTION_IMAGE_CONFIGS.SINGLE_IMAGE_BOTTOM.minWidth}
                            minHeight={PROGRAM_SECTION_IMAGE_CONFIGS.SINGLE_IMAGE_BOTTOM.minHeight}
                            imageLabel={COMMON_TEXT_ADMIN.INPUT.DRAG_AND_DROP_FILE_HERE}
                            imageSubText={COMMON_TEXT_ADMIN.INPUT.getImageSizeSubText(
                                PROGRAM_SECTION_IMAGE_CONFIGS.SINGLE_IMAGE_BOTTOM.cropHeight,
                                PROGRAM_SECTION_IMAGE_CONFIGS.SINGLE_IMAGE_BOTTOM.cropWidth,
                            )}
                            variant="programSection"
                            maxSizeMB={PROGRAM_VALIDATION.images.maxSizeMB}
                            disabled={mode === ProgramSectionMode.View}
                        />
                    ) : (
                        imageSrc && <img src={imageSrc} alt="" className={baseStyles.image} />
                    )}
                </div>
            </div>
        </div>
    );
};
