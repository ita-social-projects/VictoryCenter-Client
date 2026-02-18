import cn from 'classnames';
import { ImagesBottomSection } from '../shared/images-bottom-section/ImagesBottomSection';
import { ImageValues, Image } from '@/types/common/image';
import { DUAL_IMAGES_CONFIG } from '@/const/admin/programs';
import { ProgramSectionMode, ProgramSectionTemplate } from '@/types/common/program-sections';
import styles from './DualImagesBottom.module.scss';
import viewStyles from './ViewDualImagesBottom.module.scss';

export interface DualImagesBottomProps {
    title?: string;
    description?: string;
    images?: (Image | ImageValues | null)[];
    mode?: ProgramSectionMode;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    onImagesChange?: (index: number, file: ImageValues | null) => void;
    validationResetKey?: number;
}

export const DualImagesBottom = ({
    title = '',
    description = '',
    images = [null, null],
    mode = ProgramSectionMode.View,
    onTitleChange,
    onDescriptionChange,
    onImagesChange,
    validationResetKey,
}: DualImagesBottomProps) => {
    const baseStyles = mode === ProgramSectionMode.View ? viewStyles : styles;
    const imageHandlers = images.map((image, index) => ({
        handler: onImagesChange ? (file: ImageValues | null) => onImagesChange(index, file) : undefined,
        key: `image${index + 1}`,
        value: image,
    }));

    return (
        <ImagesBottomSection
            template={ProgramSectionTemplate.DualImagesBottom}
            title={title}
            description={description}
            images={images}
            imageHandlers={imageHandlers}
            config={DUAL_IMAGES_CONFIG}
            mode={mode}
            onTitleChange={onTitleChange}
            onDescriptionChange={onDescriptionChange}
            validationResetKey={validationResetKey}
            className={cn(baseStyles.container, {
                [styles['form-container']]: mode === ProgramSectionMode.Edit,
            })}
            topSectionClassName={baseStyles['top-section']}
            bottomSectionClassName={baseStyles['bottom-section']}
            imageWrapperClassName={baseStyles['image-wrapper']}
            imageClassName={baseStyles.image}
        />
    );
};
