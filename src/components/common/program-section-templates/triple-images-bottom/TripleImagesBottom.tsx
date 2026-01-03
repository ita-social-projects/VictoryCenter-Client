import { ImagesBottomSection, ImagesBottomSectionConfig } from '../shared/images-bottom-section/ImagesBottomSection';
import { ImageValues } from '@/types/common/image';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { PROGRAM_SECTION_IMAGE_CONFIGS } from '@/const/admin/programs';

export interface TripleImagesBottomProps {
    title?: string;
    description?: string;
    images?: string[];
    isTemplate?: boolean;
    isEditable?: boolean;
    onTitleChange?: (value: string) => void;
    onDescriptionChange?: (value: string) => void;
    onImagesChange?: (index: number, file: ImageValues | null) => void;
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
    images = ['', '', ''],
    isTemplate = false,
    isEditable = false,
    onTitleChange,
    onDescriptionChange,
    onImagesChange,
}: TripleImagesBottomProps) => {
    const imageHandlers = images.map((image, index) => ({
        handler: onImagesChange ? (file: ImageValues | null) => onImagesChange(index, file) : undefined,
        key: `image${index + 1}`,
        value: image,
    }));

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
