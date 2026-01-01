import { ImagesBottomSection, ImagesBottomSectionConfig } from '../shared/images-bottom-section/ImagesBottomSection';
import { ImageValues } from '@/types/common/image';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { PROGRAM_SECTION_IMAGE_CONFIGS } from '@/const/admin/programs';

export interface DualImagesBottomProps {
    title?: string;
    description?: string;
    image1?: string;
    image2?: string;
    isTemplate?: boolean;
    isEditable?: boolean;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    onImage1Change?: (file: ImageValues | null) => void;
    onImage2Change?: (file: ImageValues | null) => void;
}

const DUAL_IMAGES_CONFIG: ImagesBottomSectionConfig = {
    imageCount: 2,
    gridColumns: 2,
    imageConfig: PROGRAM_SECTION_IMAGE_CONFIGS.DUAL_IMAGES,
    elevatedIndices: [0],
    imageLabel: COMMON_TEXT_ADMIN.INPUT.ADD_FILE_HERE,
    editableImageMaxHeight: 430,
    editableImageMaxWidth: 730,
};

export const DualImagesBottom = ({
    title = '',
    description = '',
    image1 = '',
    image2 = '',
    isTemplate = false,
    isEditable = false,
    onTitleChange,
    onDescriptionChange,
    onImage1Change,
    onImage2Change,
}: DualImagesBottomProps) => {
    const images = [image1, image2];
    const imageHandlers = [
        { handler: onImage1Change, key: 'image1', value: image1 },
        { handler: onImage2Change, key: 'image2', value: image2 },
    ];

    return (
        <ImagesBottomSection
            variant="dual"
            title={title}
            description={description}
            images={images}
            imageHandlers={imageHandlers}
            config={DUAL_IMAGES_CONFIG}
            isTemplate={isTemplate}
            isEditable={isEditable}
            onTitleChange={onTitleChange}
            onDescriptionChange={onDescriptionChange}
        />
    );
};
