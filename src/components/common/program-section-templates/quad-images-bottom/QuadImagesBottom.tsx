import { ImagesBottomSection, ImagesBottomSectionConfig } from '../shared/images-bottom-section/ImagesBottomSection';
import { ImageValues } from '@/types/common/image';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { PROGRAM_SECTION_IMAGE_CONFIGS } from '@/const/admin/programs';

export interface QuadImagesBottomProps {
    title?: string;
    description?: string;
    image1?: string;
    image2?: string;
    image3?: string;
    image4?: string;
    isTemplate?: boolean;
    isEditable?: boolean;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    onImage1Change?: (file: ImageValues | null) => void;
    onImage2Change?: (file: ImageValues | null) => void;
    onImage3Change?: (file: ImageValues | null) => void;
    onImage4Change?: (file: ImageValues | null) => void;
}

const QUAD_IMAGES_CONFIG: ImagesBottomSectionConfig = {
    imageCount: 4,
    gridColumns: 4,
    imageConfig: PROGRAM_SECTION_IMAGE_CONFIGS.QUAD_IMAGES,
    elevatedIndices: [1, 3],
    imageLabel: COMMON_TEXT_ADMIN.INPUT.ADD_FILE_HERE,
    editableGridColumns: 4,
    editableImageMaxHeight: 390,
    editableImageMaxWidth: 360,
};

export const QuadImagesBottom = ({
    title = '',
    description = '',
    image1 = '',
    image2 = '',
    image3 = '',
    image4 = '',
    isTemplate = false,
    isEditable = false,
    onTitleChange,
    onDescriptionChange,
    onImage1Change,
    onImage2Change,
    onImage3Change,
    onImage4Change,
}: QuadImagesBottomProps) => {
    const images = [image1, image2, image3, image4];
    const imageHandlers = [
        { handler: onImage1Change, key: 'image1', value: image1 },
        { handler: onImage2Change, key: 'image2', value: image2 },
        { handler: onImage3Change, key: 'image3', value: image3 },
        { handler: onImage4Change, key: 'image4', value: image4 },
    ];

    return (
        <ImagesBottomSection
            variant="quad"
            title={title}
            description={description}
            images={images}
            imageHandlers={imageHandlers}
            config={QUAD_IMAGES_CONFIG}
            isTemplate={isTemplate}
            isEditable={isEditable}
            onTitleChange={onTitleChange}
            onDescriptionChange={onDescriptionChange}
        />
    );
};
