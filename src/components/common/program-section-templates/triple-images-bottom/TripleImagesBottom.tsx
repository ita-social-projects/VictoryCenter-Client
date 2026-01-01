import { ImagesBottomSection, ImagesBottomSectionConfig } from '../shared/images-bottom-section/ImagesBottomSection';
import { ImageValues } from '@/types/common/image';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { PROGRAM_SECTION_IMAGE_CONFIGS } from '@/const/admin/programs';

export interface TripleImagesBottomProps {
    title?: string;
    description?: string;
    image1?: string;
    image2?: string;
    image3?: string;
    isTemplate?: boolean;
    isEditable?: boolean;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    onImage1Change?: (file: ImageValues | null) => void;
    onImage2Change?: (file: ImageValues | null) => void;
    onImage3Change?: (file: ImageValues | null) => void;
}

const TRIPLE_IMAGES_CONFIG: ImagesBottomSectionConfig = {
    imageCount: 3,
    gridColumns: 3,
    imageConfig: PROGRAM_SECTION_IMAGE_CONFIGS.TRIPLE_IMAGES,
    elevatedIndices: [0, 2],
    imageLabel: COMMON_TEXT_ADMIN.INPUT.ADD_FILE_HERE,
    editableGridColumns: 4,
    editableImageMaxHeight: 480,
    editableImageMaxWidth: 480,
};

export const TripleImagesBottom = ({
    title = '',
    description = '',
    image1 = '',
    image2 = '',
    image3 = '',
    isTemplate = false,
    isEditable = false,
    onTitleChange,
    onDescriptionChange,
    onImage1Change,
    onImage2Change,
    onImage3Change,
}: TripleImagesBottomProps) => {
    const images = [image1, image2, image3];
    const imageHandlers = [
        { handler: onImage1Change, key: 'image1', value: image1 },
        { handler: onImage2Change, key: 'image2', value: image2 },
        { handler: onImage3Change, key: 'image3', value: image3 },
    ];

    return (
        <ImagesBottomSection
            variant="triple"
            title={title}
            description={description}
            images={images}
            imageHandlers={imageHandlers}
            config={TRIPLE_IMAGES_CONFIG}
            isTemplate={isTemplate}
            isEditable={isEditable}
            onTitleChange={onTitleChange}
            onDescriptionChange={onDescriptionChange}
        />
    );
};
