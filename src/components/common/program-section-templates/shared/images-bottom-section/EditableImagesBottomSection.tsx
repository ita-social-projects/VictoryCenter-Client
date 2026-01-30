import cn from 'classnames';
import { ImageValues, Image } from '@/types/common/image';
import { PhotoInputGroup } from '@/components/admin/input-groups/photo-input-group/PhotoInputGroup';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { PROGRAM_VALIDATION } from '@/const/admin/programs';
import { getImageSrc } from '@/utils/functions/image-helper/image-helper';
import { ProgramSectionMode } from '@/types/common/program-sections';
import { ImageHandler, ImagesBottomSectionConfig } from './ImagesBottomSection';
import baseStyles from './ImagesBottomSection.module.scss';

interface EditableImagesBottomSectionProps {
    images: (Image | ImageValues | null)[];
    imageHandlers: ImageHandler[];
    imageKeys: string[];
    config: ImagesBottomSectionConfig;
    mode: ProgramSectionMode;
    bottomSectionClassName?: string;
    imageWrapperClassName?: string;
    errors: string[];
    onSetError: (index: number, error: string | null) => void;
}

export const EditableImagesBottomSection = ({
    images,
    imageHandlers,
    imageKeys,
    config,
    mode,
    bottomSectionClassName = '',
    imageWrapperClassName = '',
    errors,
    onSetError,
}: EditableImagesBottomSectionProps) => {
    return (
        <div className={cn(baseStyles['bottom-section'], bottomSectionClassName)}>
            <div className={baseStyles['images-grid']}>
                {mode === ProgramSectionMode.Edit || mode === ProgramSectionMode.View
                    ? imageHandlers.map(({ handler, key, value }, index) => (
                          <div
                              key={key}
                              className={cn(baseStyles['image-wrapper'], imageWrapperClassName)}
                              data-elevated={config.elevatedIndices.includes(index) ? 'true' : undefined}
                              data-testid="image-wrapper"
                          >
                              <PhotoInputGroup
                                  id={`section-image-${index + 1}`}
                                  name={`section-image-${index + 1}`}
                                  value={value}
                                  onChange={handler || (() => {})}
                                  setError={(error) => onSetError(index, error)}
                                  error={errors[index]}
                                  cropWidth={config.imageConfig.cropWidth}
                                  cropHeight={config.imageConfig.cropHeight}
                                  minWidth={config.imageConfig.minWidth}
                                  minHeight={config.imageConfig.minHeight}
                                  imageLabel={config.imageLabel}
                                  imageSubText={COMMON_TEXT_ADMIN.INPUT.getImageSizeSubText(
                                      config.imageConfig.cropHeight,
                                      config.imageConfig.cropWidth,
                                  )}
                                  variant="programSection"
                                  maxSizeMB={PROGRAM_VALIDATION.images.maxSizeMB}
                                  disabled={mode === ProgramSectionMode.View}
                              />
                          </div>
                      ))
                    : images.map((image, index) => {
                          const imageSrc = getImageSrc(image);
                          return (
                              <div
                                  key={imageKeys[index]}
                                  className={cn(baseStyles['image-wrapper'], imageWrapperClassName)}
                                  data-elevated={config.elevatedIndices.includes(index) ? 'true' : undefined}
                                  data-testid="image-wrapper"
                              >
                                  {imageSrc && (
                                      <img
                                          src={imageSrc}
                                          alt={`Program section ${index + 1}`}
                                          className={baseStyles.image}
                                      />
                                  )}
                              </div>
                          );
                      })}
            </div>
        </div>
    );
};
