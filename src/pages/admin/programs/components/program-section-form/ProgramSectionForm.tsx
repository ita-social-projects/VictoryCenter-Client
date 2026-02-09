import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/admin/button/Button';
import { ImageValues } from '@/types/common/image';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import { renderProgramSection } from '@/utils/functions/render-program-section';
import styles from './ProgramSectionForm.module.scss';
import {
    ProgramSection,
    ProgramSectionContent,
    ProgramSectionTemplate,
    ProgramSectionMode,
} from '@/types/common/program-sections';
import { ContentType } from '@/types/common/programs';

export interface ProgramSectionFormProps {
    section: ProgramSection;
    onSave: () => void;
    onCancel: (options: SectionCancelOptions) => void;
    isDisabled?: boolean;
    onSectionChange?: (updatedSection: ProgramSection) => void;
    isNewSection?: boolean;
    isSectionValid?: boolean;
    onEditStateChange?: (isEditing: boolean) => void;
    onDelete?: () => void;
isReplacingTemplate?: boolean;
    onRequestReplace?: () => void;
    preReplacementSection?: ProgramSection | null;
}

export interface SectionCancelOptions {
    isDirty: boolean;
    shouldRemove: boolean;
    revertTo: ProgramSection;
    onAfterDiscard: () => void;
}

const getContentByType = (contents: ProgramSectionContent[], type: ContentType): ProgramSectionContent | undefined => {
    return contents.find((c) => c.contentType === type);
};

const getDescriptionsInOrder = (contents: ProgramSectionContent[]) => {
    return contents.filter((c) => c.contentType === ContentType.Description).sort((a, b) => a.order - b.order);
};

export const ProgramSectionForm = ({
    section,
    onSave,
    onCancel,
    isDisabled = false,
    onSectionChange,
    isNewSection = false,
    isSectionValid = false,
    onEditStateChange,
    onDelete,
}: ProgramSectionFormProps) => {
    const [localSection, setLocalSection] = useState<ProgramSection>(section);
    const [originalSection, setOriginalSection] = useState<ProgramSection>(section);
    const [isDirty, setIsDirty] = useState(false);
    const [validationResetKey, setValidationResetKey] = useState(0);
    const [sectionMode, setSectionMode] = useState<ProgramSectionMode>(
        isNewSection ? ProgramSectionMode.Edit : ProgramSectionMode.View,
    );
    const sectionModeRef = useRef(sectionMode);
    const onEditStateChangeRef = useRef(onEditStateChange);

    useEffect(() => {
        sectionModeRef.current = sectionMode;
    }, [sectionMode]);

    useEffect(() => {
        onEditStateChangeRef.current = onEditStateChange;
    }, [onEditStateChange]);

    useEffect(() => {
        setLocalSection(section);
        if (sectionModeRef.current !== ProgramSectionMode.Edit) {
            setOriginalSection(section);
            setIsDirty(false);
            setSectionMode(isNewSection ? ProgramSectionMode.Edit : ProgramSectionMode.View);
        }
    }, [section, isNewSection]);

    useEffect(() => {
        onEditStateChangeRef.current?.(sectionMode === ProgramSectionMode.Edit);
    }, [sectionMode]);

    const titleContent = getContentByType(localSection.contents, ContentType.Title);

    const orderedTitleContents = localSection.contents
        .filter((c) => c.contentType === ContentType.Title)
        .sort((a, b) => a.order - b.order);

    const orderedDescriptionContents = getDescriptionsInOrder(localSection.contents);

    const descriptions = orderedDescriptionContents.map((c) => c.description || '');
    const description = descriptions[0] || '';

    const imageContents = localSection.contents
        .filter((c) => c.contentType === ContentType.Image)
        .sort((a, b) => a.order - b.order)
        .map((c) => c.image || null);

    const cards = orderedTitleContents.map((t, i) => ({
        title: t.title || '',
        description: orderedDescriptionContents[i]?.description || '',
    }));

    const handleTitleChange = useCallback(
        (value: string) => {
            let newSection: ProgramSection;
            setLocalSection((prev) => {
                const updatedContents = prev.contents.map((c) =>
                    c.contentType === ContentType.Title ? { ...c, title: value } : c,
                );
                newSection = { ...prev, contents: updatedContents };
                return newSection;
            });
            setIsDirty(true);
            onSectionChange?.(newSection!);
        },
        [onSectionChange],
    );

    const handleDescriptionChange = useCallback(
        (value: string) => {
            let newSection: ProgramSection;
            setLocalSection((prev) => {
                const updatedContents = prev.contents.map((c) =>
                    c.contentType === ContentType.Description ? { ...c, description: value } : c,
                );
                newSection = { ...prev, contents: updatedContents };
                return newSection;
            });
            setIsDirty(true);
            onSectionChange?.(newSection!);
        },
        [onSectionChange],
    );

    const handleDescriptionsChange = useCallback(
        (index: number, value: string) => {
            let newSection: ProgramSection | undefined;
            setLocalSection((prev) => {
                const ordered = getDescriptionsInOrder(prev.contents);
                const target = ordered[index];
                if (!target) return prev;

                const updatedContents = prev.contents.map((c) =>
                    c.contentType === ContentType.Description && c.order === target.order
                        ? { ...c, description: value }
                        : c,
                );

                newSection = { ...prev, contents: updatedContents };
                return newSection;
            });
            if (newSection) {
                setIsDirty(true);
                onSectionChange?.(newSection);
            }
        },
        [onSectionChange],
    );

    const handleCardContentChange = useCallback(
        (index: number, value: string, type: ContentType.Title | ContentType.Description) => {
            let newSection: ProgramSection | undefined;
            setLocalSection((prev) => {
                const filteredContents = prev.contents
                    .filter((c) => c.contentType === type)
                    .sort((a, b) => a.order - b.order);

                const target = filteredContents[index];
                if (!target) return prev;

                const updatedContents = prev.contents.map((c) =>
                    c === target
                        ? type === ContentType.Title
                            ? { ...c, title: value }
                            : { ...c, description: value }
                        : c,
                );

                newSection = { ...prev, contents: updatedContents };
                return newSection;
            });
            if (newSection) {
                setIsDirty(true);
                onSectionChange?.(newSection);
            }
        },
        [onSectionChange],
    );

    const updateImageContent = useCallback(
        (order: number, file: ImageValues | null, prev: ProgramSection): ProgramSection => {
            const updatedContents = prev.contents.map((c) =>
                c.contentType === ContentType.Image && c.order === order ? { ...c, image: file } : c,
            );
            return { ...prev, contents: updatedContents };
        },
        [],
    );

    const handleImagesChange = useCallback(
        (index: number, file: ImageValues | null) => {
            let newSection: ProgramSection | undefined;
            setLocalSection((prev) => {
                const imageContentsList = prev.contents.filter((c) => c.contentType === ContentType.Image);
                imageContentsList.sort((a, b) => a.order - b.order);

                if (index < imageContentsList.length) {
                    const targetOrder = imageContentsList[index].order;
                    newSection = updateImageContent(targetOrder, file, prev);
                    return newSection;
                }
                return prev;
            });
            if (newSection) {
                setIsDirty(true);
                onSectionChange?.(newSection);
            }
        },
        [onSectionChange, updateImageContent],
    );

    const handleEditClick = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setOriginalSection(localSection);
            setIsDirty(false);
            setSectionMode(ProgramSectionMode.Edit);
        },
        [localSection],
    );

    const handleSaveClick = useCallback(() => {
        if (isDisabled || !isSectionValid) return;
        onSave();
        setOriginalSection(localSection);
        setIsDirty(false);
        setSectionMode(ProgramSectionMode.View);
        setValidationResetKey((prev) => prev + 1);
    }, [isDisabled, isSectionValid, onSave, localSection]);

    const CARD_TEMPLATES = [
        ProgramSectionTemplate.DualTitleDescription,
        ProgramSectionTemplate.TripleTitleDescription,
        ProgramSectionTemplate.QuadTitleDescription,
    ];

    const isCardTemplate = CARD_TEMPLATES.includes(section.template);

    const handleCancelClick = useCallback(() => {
        const shouldRemove = isNewSection;
        const revertTo = originalSection;
        const onAfterDiscard = () => {
            if (!shouldRemove) {
                setLocalSection(revertTo);
                setIsDirty(false);
                setSectionMode(ProgramSectionMode.View);
                setValidationResetKey((prev) => prev + 1);
            }
        };

        onCancel({
            isDirty,
            shouldRemove,
            revertTo,
            onAfterDiscard,
        });
    }, [isDirty, isNewSection, onCancel, originalSection]);

    const handleDeleteClick = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            e.stopPropagation();
            if (onDelete) {
                onDelete();
            }
        },
        [onDelete],
    );

    const editableSection = renderProgramSection({
        templateId: section.template,
        data: {
            title: titleContent?.title || '',
            description,
            descriptions,
            images: imageContents,
            ...(isCardTemplate ? { cards } : {}),
        },
        mode: sectionMode,
        validationResetKey,
        handlers: {
            onTitleChange: handleTitleChange,
            onDescriptionChange: handleDescriptionChange,
            onDescriptionsChange: handleDescriptionsChange,
            onImagesChange: handleImagesChange,
            ...(isCardTemplate
                ? {
                      onCardTitleChange: (index: number, value: string) =>
                          handleCardContentChange(index, value, ContentType.Title),
                      onCardDescriptionChange: (index: number, value: string) =>
                          handleCardContentChange(index, value, ContentType.Description),
                  }
                : {}),
        },
    });

    return (
        <div className={styles.container}>
            <div className={styles['actions-section']}>
                {sectionMode === ProgramSectionMode.View && (
                    <div className={styles['hover-buttons']}>
                        <button
                            type="button"
                            onClick={handleEditClick}
                            className={`${styles['icon-button']} ${styles['edit-button']}`}
                            aria-label="Edit section"
                        />
                        <button
                            type="button"
                            onClick={handleDeleteClick}
                            className={`${styles['icon-button']} ${styles['delete-button']}`}
                            aria-label="Delete section"
                        />
                        <button
                            type="button"
                            className={`${styles['icon-button']} ${styles['change-button']}`}
                            aria-label="Replace section"
                        />
                    </div>
                )}
            </div>
            <div className={styles.content}>
                {editableSection || (
                    <p className={styles['template-info']}>
                        Template ID: <strong>{section.template}</strong> (not found in renderer)
                    </p>
                )}
            </div>
            <div className={styles['actions-container']}>
                {sectionMode !== ProgramSectionMode.View && (
                    <div className={styles.actions}>
                        <Button buttonStyle="secondary" onClick={handleCancelClick} disabled={isDisabled}>
                            {PROGRAMS_TEXT.BUTTON.CANCEL}
                        </Button>
                        <Button
                            buttonStyle="primary"
                            onClick={handleSaveClick}
                            disabled={isDisabled || !isSectionValid}
                        >
                            {PROGRAMS_TEXT.BUTTON.SAVE}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
