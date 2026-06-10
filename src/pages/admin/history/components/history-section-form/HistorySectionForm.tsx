import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    createSectionFormActionsClassNames,
    SectionFormActions,
} from '@/components/admin/section-form-actions/SectionFormActions';
import { ImageValues } from '@/types/common/image';
import {
    HistorySectionContentLocalizableFields,
    HistorySectionContentDto,
    HistorySectionDto,
} from '@/types/common/history-sections';
import { ContentType } from '@/types/common/section-contents';
import { SectionMode } from '@/types/common/sections';
import {
    getInitialHistorySectionContents,
    isHistoryTemplate,
    renderHistorySection,
} from '@/utils/functions/render-history-section';
import { buildSectionCancelOptions } from '@/utils/functions/section-cancel-flow/section-cancel-flow';
import styles from './HistorySectionForm.module.scss';
import { LocalizationLanguage } from '@/types/common/language';
import { returnDisplayedLocalization } from '@/utils/functions/localization/localization';
import { mapHistorySectionContentDtoToModel } from '@/utils/functions/mappers/admin/history/history-mappers';

const SUPPORTED_CONTENT_TYPES = new Set<ContentType>([ContentType.Title, ContentType.Description, ContentType.Image]);
const sectionFormActionsClassNames = createSectionFormActionsClassNames(styles);

const getOrderedContentsByType = (
    contents: HistorySectionContentDto[],
    type: ContentType,
): HistorySectionContentDto[] => {
    return contents.filter((content) => content.contentType === type).sort((a, b) => a.order - b.order);
};

const areContentsEqual = (left: HistorySectionContentDto, right: HistorySectionContentDto): boolean => {
    return (
        left.id === right.id &&
        left.sectionId === right.sectionId &&
        left.contentType === right.contentType &&
        left.order === right.order &&
        left.title === right.title &&
        left.description === right.description &&
        left.image === right.image &&
        left.imageId === right.imageId
    );
};

const normalizeHistorySectionContents = (section: HistorySectionDto): HistorySectionDto => {
    if (!isHistoryTemplate(section.template)) {
        return section;
    }

    const titleContent = getOrderedContentsByType(section.contents, ContentType.Title)[0];
    const descriptionContent = getOrderedContentsByType(section.contents, ContentType.Description)[0];
    const imageContents = getOrderedContentsByType(section.contents, ContentType.Image);

    let imageIndex = 0;
    const normalizedContents = getInitialHistorySectionContents(section.template).map((expectedContent) => {
        if (expectedContent.contentType === ContentType.Title) {
            return titleContent
                ? { ...titleContent, contentType: ContentType.Title, order: expectedContent.order }
                : { ...expectedContent };
        }

        if (expectedContent.contentType === ContentType.Description) {
            return descriptionContent
                ? { ...descriptionContent, contentType: ContentType.Description, order: expectedContent.order }
                : { ...expectedContent };
        }

        const imageContent = imageContents[imageIndex];
        imageIndex += 1;

        return imageContent
            ? { ...imageContent, contentType: ContentType.Image, order: expectedContent.order }
            : { ...expectedContent };
    });

    const hasUnsupportedContentTypes = section.contents.some(
        (content) => !SUPPORTED_CONTENT_TYPES.has(content.contentType),
    );

    const hasSameContents =
        !hasUnsupportedContentTypes &&
        section.contents.length === normalizedContents.length &&
        normalizedContents.every((content, index) => {
            const currentContent = section.contents[index];
            return currentContent ? areContentsEqual(content, currentContent) : false;
        });

    return hasSameContents ? section : { ...section, contents: normalizedContents };
};

const getExpectedImageCount = (section: HistorySectionDto): number => {
    return getInitialHistorySectionContents(section.template).filter(
        (content) => content.contentType === ContentType.Image,
    ).length;
};

const getHistorySectionData = (section: HistorySectionDto) => {
    const title = getOrderedContentsByType(section.contents, ContentType.Title)[0]?.title ?? '';
    const description = getOrderedContentsByType(section.contents, ContentType.Description)[0]?.description ?? '';

    const images = getOrderedContentsByType(section.contents, ContentType.Image).map(
        (content) => content.image ?? null,
    );

    const expectedImageCount = getExpectedImageCount(section);
    while (images.length < expectedImageCount) {
        images.push(null);
    }

    return {
        title,
        description,
        images,
    };
};

export interface HistorySectionFormProps {
    section: HistorySectionDto;
    sectionKey?: string;
    onSave: () => void;
    onCancel: (options: SectionCancelOptions) => void;
    isDisabled?: boolean;
    onSectionChange?: (updatedSection: HistorySectionDto) => void;
    isNewSection?: boolean;
    isSectionValid?: boolean;
    onEditStateChange?: (isEditing: boolean) => void;
    onDelete?: () => void;
    isReplacingTemplate?: boolean;
    onRequestReplace?: () => void;
    isFirstSection: boolean;
    isLastSection: boolean;
    onMoveUpSection: () => void;
    onMoveDownSection: () => void;
    onRequestSaveSection?: (request: { onConfirm: () => void }) => void;
    language?: LocalizationLanguage;
}

export interface SectionCancelOptions {
    isDirty: boolean;
    shouldRemove: boolean;
    revertTo: HistorySectionDto;
    onAfterDiscard: () => void;
    isTemplateReplacement?: boolean;
}

export const HistorySectionForm = ({
    section,
    sectionKey,
    onSave,
    onCancel,
    isDisabled = false,
    onSectionChange,
    isNewSection = false,
    isSectionValid = true,
    onEditStateChange,
    onDelete,
    isReplacingTemplate = false,
    onRequestReplace,
    isFirstSection = false,
    isLastSection = false,
    onMoveDownSection,
    onMoveUpSection,
    onRequestSaveSection,
    language,
}: HistorySectionFormProps) => {
    const [localSection, setLocalSection] = useState<HistorySectionDto>(() => normalizeHistorySectionContents(section));
    const [originalSection, setOriginalSection] = useState<HistorySectionDto>(() =>
        normalizeHistorySectionContents(section),
    );
    const [textFields, setTextFields] = useState<HistorySectionContentLocalizableFields>();
    const [isDirty, setIsDirty] = useState(false);
    const [validationResetKey, setValidationResetKey] = useState(0);
    const [sectionMode, setSectionMode] = useState<SectionMode>(
        isNewSection || isReplacingTemplate ? SectionMode.Edit : SectionMode.View,
    );

    const sectionModeRef = useRef(sectionMode);
    const onEditStateChangeRef = useRef(onEditStateChange);
    const onSectionChangeRef = useRef(onSectionChange);
    const lastEmittedSectionRef = useRef<HistorySectionDto | null>(null);
    const localSectionRef = useRef<HistorySectionDto>(localSection);
    localSectionRef.current = localSection;

    useEffect(() => {
        sectionModeRef.current = sectionMode;
    }, [sectionMode]);

    useEffect(() => {
        const titleContent = getOrderedContentsByType(localSection.contents, ContentType.Title)[0];
        const descriptionContent = getOrderedContentsByType(localSection.contents, ContentType.Description)[0];

        let title = titleContent?.title ?? '';
        let description = descriptionContent?.description ?? '';

        if (language) {
            if (titleContent) {
                const mapped = mapHistorySectionContentDtoToModel(titleContent);
                const loc = returnDisplayedLocalization(mapped, language.code);
                title = loc?.title || title;
            }
            if (descriptionContent) {
                const mapped = mapHistorySectionContentDtoToModel(descriptionContent);
                const loc = returnDisplayedLocalization(mapped, language.code);
                description = loc?.description || description;
            }
        }

        setTextFields({ title, description });
    }, [language, localSection]);

    useEffect(() => {
        onEditStateChangeRef.current = onEditStateChange;
    }, [onEditStateChange]);

    useEffect(() => {
        onSectionChangeRef.current = onSectionChange;
    }, [onSectionChange]);

    useEffect(() => {
        if (lastEmittedSectionRef.current === section) {
            return;
        }

        const preparedSection = normalizeHistorySectionContents(section);

        setLocalSection(preparedSection);
        localSectionRef.current = preparedSection;

        if (sectionModeRef.current !== SectionMode.Edit) {
            if (!isReplacingTemplate) {
                setOriginalSection(preparedSection);
            }
            setIsDirty(false);
            setSectionMode(isNewSection || isReplacingTemplate ? SectionMode.Edit : SectionMode.View);
        }

        if (preparedSection !== section) {
            lastEmittedSectionRef.current = preparedSection;
            onSectionChangeRef.current?.(preparedSection);
        }
    }, [section, isNewSection, isReplacingTemplate]);

    useEffect(() => {
        onEditStateChangeRef.current?.(sectionMode === SectionMode.Edit);
    }, [sectionMode]);

    const emitSectionChange = useCallback((updatedSection: HistorySectionDto) => {
        lastEmittedSectionRef.current = updatedSection;
        setIsDirty(true);
        onSectionChangeRef.current?.(updatedSection);
    }, []);

    const handleTitleChange = useCallback(
        (value: string) => {
            const prev = localSectionRef.current;
            const titleContent = getOrderedContentsByType(prev.contents, ContentType.Title)[0];
            if (!titleContent) {
                return;
            }

            const updatedContents = prev.contents.map((content) =>
                content.contentType === ContentType.Title && content.order === titleContent.order
                    ? { ...content, title: value }
                    : content,
            );

            const newSection = { ...prev, contents: updatedContents };
            localSectionRef.current = newSection;
            setLocalSection(newSection);
            emitSectionChange(newSection);
        },
        [emitSectionChange],
    );

    const handleDescriptionChange = useCallback(
        (value: string) => {
            const prev = localSectionRef.current;
            const descriptionContent = getOrderedContentsByType(prev.contents, ContentType.Description)[0];
            if (!descriptionContent) {
                return;
            }

            const updatedContents = prev.contents.map((content) =>
                content.contentType === ContentType.Description && content.order === descriptionContent.order
                    ? { ...content, description: value }
                    : content,
            );

            const newSection = { ...prev, contents: updatedContents };
            localSectionRef.current = newSection;
            setLocalSection(newSection);
            emitSectionChange(newSection);
        },
        [emitSectionChange],
    );

    const handleImagesChange = useCallback(
        (index: number, file: ImageValues | null) => {
            const prev = localSectionRef.current;
            const expectedImageCount = getExpectedImageCount(prev);
            if (index < 0 || index >= expectedImageCount) {
                return;
            }

            const imageContents = getOrderedContentsByType(prev.contents, ContentType.Image);
            const targetContent = imageContents[index];
            if (!targetContent) {
                return;
            }

            const updatedContents = prev.contents.map((content) =>
                content.contentType === ContentType.Image && content.order === targetContent.order
                    ? { ...content, image: file }
                    : content,
            );

            const newSection = { ...prev, contents: updatedContents };
            localSectionRef.current = newSection;
            setLocalSection(newSection);
            emitSectionChange(newSection);
        },
        [emitSectionChange],
    );

    const handleEditClick = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            event.stopPropagation();
            setOriginalSection(localSection);
            setIsDirty(false);
            setSectionMode(SectionMode.Edit);
        },
        [localSection],
    );

    const hasDeletedExistingImage = useMemo(() => {
        const originalImages = getOrderedContentsByType(originalSection.contents, ContentType.Image);
        const currentImages = getOrderedContentsByType(localSection.contents, ContentType.Image);
        const maxLength = Math.max(originalImages.length, currentImages.length);

        for (let index = 0; index < maxLength; index += 1) {
            const hadImage = Boolean(originalImages[index]?.image);
            const hasImage = Boolean(currentImages[index]?.image);

            if (hadImage && !hasImage) {
                return true;
            }
        }

        return false;
    }, [localSection.contents, originalSection.contents]);

    const isSectionSaveValid =
        isSectionValid && isHistoryTemplate(localSection.template) && (isReplacingTemplate || !hasDeletedExistingImage);

    const handleSaveClick = useCallback(() => {
        if (isDisabled || !isSectionSaveValid) {
            return;
        }

        const applySave = () => {
            onSave();
            setOriginalSection(localSection);
            setIsDirty(false);
            setSectionMode(SectionMode.View);
            setValidationResetKey((prev) => prev + 1);
        };

        if (onRequestSaveSection && isDirty) {
            onRequestSaveSection({ onConfirm: applySave });
            return;
        }

        applySave();
    }, [isDisabled, isSectionSaveValid, onSave, localSection, onRequestSaveSection, isDirty]);

    const handleCancelClick = useCallback(() => {
        onCancel(
            buildSectionCancelOptions({
                isDirty,
                isNewSection,
                originalSection,
                isReplacingTemplate,
                onRevert: (sectionToRevert) => {
                    localSectionRef.current = sectionToRevert;
                    setLocalSection(sectionToRevert);
                    setIsDirty(false);
                    setSectionMode(SectionMode.View);
                    setValidationResetKey((prev) => prev + 1);
                },
            }),
        );
    }, [isDirty, isNewSection, onCancel, originalSection, isReplacingTemplate]);

    const handleDeleteClick = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            event.stopPropagation();
            onDelete?.();
        },
        [onDelete],
    );

    const handleReplaceClick = useCallback(
        (event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            event.stopPropagation();
            onRequestReplace?.();
        },
        [onRequestReplace],
    );

    const rawSectionData = getHistorySectionData(localSection);
    const sectionData =
        sectionMode === SectionMode.View
            ? {
                  ...rawSectionData,
                  title: textFields?.title ?? rawSectionData.title,
                  description: textFields?.description ?? rawSectionData.description,
              }
            : rawSectionData;

    const sectionToRender = renderHistorySection({
        templateId: localSection.template,
        data: sectionData,
        mode: sectionMode,
        validationResetKey,
        handlers: {
            onTitleChange: handleTitleChange,
            onDescriptionChange: handleDescriptionChange,
            onImagesChange: handleImagesChange,
        },
    });

    return (
        <div className={styles['section-container']} data-section-key={sectionKey}>
            <SectionFormActions
                sectionMode={sectionMode}
                isFirstSection={isFirstSection}
                isLastSection={isLastSection}
                isDisabled={isDisabled}
                isDirty={isDirty}
                isSectionSaveValid={isSectionSaveValid}
                classNames={sectionFormActionsClassNames}
                onMoveUpSection={onMoveUpSection}
                onMoveDownSection={onMoveDownSection}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteClick}
                onReplaceClick={handleReplaceClick}
                onCancelClick={handleCancelClick}
                onSaveClick={handleSaveClick}
            >
                {sectionToRender}
            </SectionFormActions>
        </div>
    );
};
