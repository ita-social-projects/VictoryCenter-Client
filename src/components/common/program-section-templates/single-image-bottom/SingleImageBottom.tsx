import cn from 'classnames';
import { TitleDescriptionSection } from '../shared/title-description-section/TitleDescriptionSection';
import { PhotoInputGroup } from '@/components/admin/input-groups/photo-input-group/PhotoInputGroup';
import { ImageValues } from '@/types/common/image';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { PROGRAM_SECTION_IMAGE_CONFIGS } from '@/const/admin/programs';
import styles from './SingleImageBottom.module.scss';

export interface SingleImageBottomProps {
    title?: string;
    description?: string;
    image1?: string;
    isTemplate?: boolean;
    isEditable?: boolean;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    onImage1Change?: (file: ImageValues | null) => void;
}

export const SingleImageBottom = ({
    title = '',
    description = '',
    image1 = '',
    isTemplate = false,
    isEditable = false,
    onTitleChange,
    onDescriptionChange,
    onImage1Change,
}: SingleImageBottomProps) => {
    return (
        <div
            className={cn(styles.container, {
                [styles.template]: isTemplate,
                [styles.editable]: isEditable,
            })}
        >
            {isEditable ? (
                <>
                    <TitleDescriptionSection
                        title={title}
                        description={description}
                        className={styles['top-section']}
                        isEditable={true}
                        onTitleChange={onTitleChange}
                        onDescriptionChange={onDescriptionChange}
                    />
                    <div className={styles['bottom-section']}>
                        <div className={styles['image-wrapper']}>
                            <PhotoInputGroup
                                id="section-image-1"
                                name="section-image-1"
                                value={image1 ? { base64: image1, mimeType: '' } : null}
                                onChange={onImage1Change || (() => {})}
                                setError={() => {}}
                                cropWidth={PROGRAM_SECTION_IMAGE_CONFIGS.SINGLE_IMAGE_BOTTOM.cropWidth}
                                cropHeight={PROGRAM_SECTION_IMAGE_CONFIGS.SINGLE_IMAGE_BOTTOM.cropHeight}
                                minWidth={PROGRAM_SECTION_IMAGE_CONFIGS.SINGLE_IMAGE_BOTTOM.minWidth}
                                minHeight={PROGRAM_SECTION_IMAGE_CONFIGS.SINGLE_IMAGE_BOTTOM.minHeight}
                                imageLabel={COMMON_TEXT_ADMIN.INPUT.DRAG_AND_DROP_FILE_HERE}
                                imageSubText={COMMON_TEXT_ADMIN.INPUT.getImageSizeSubText(
                                    PROGRAM_SECTION_IMAGE_CONFIGS.SINGLE_IMAGE_BOTTOM.cropHeight,
                                    PROGRAM_SECTION_IMAGE_CONFIGS.SINGLE_IMAGE_BOTTOM.cropWidth,
                                )}
                                className="program-section-image-input"
                            />
                        </div>
                    </div>
                </>
            ) : (
                <>
                    <TitleDescriptionSection
                        title={title}
                        description={description}
                        className={styles['top-section']}
                        isTemplate={isTemplate}
                    />
                    <div className={styles['bottom-section']}>
                        <div className={styles['image-wrapper']}>
                            <img src={image1 || undefined} alt="img1-of-single-image-bottom" className={styles.image} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};
