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
}

export interface SectionCancelOptions {
    isDirty: boolean;
    shouldRemove: boolean;
    revertTo: ProgramSection;
    onAfterDiscard: () => void;
    isTemplateReplacement?: boolean;
}

const getContentByType = (contents: ProgramSectionContent[], type: ContentType): ProgramSectionContent | undefined => {
    return contents.find((c) => c.contentType === type);
};

const getDescriptionsInOrder = (contents: ProgramSectionContent[]) => {
    return contents.filter((c) => c.contentType === ContentType.Description).sort((a, b) => a.order - b.order);
};

const getDescriptionAuthorPairs = (contents: ProgramSectionContent[]) => {
    const map = new Map<number, { description: string; author: string }>();

    for (const c of contents) {
        if (c.groupIndex === null || c.groupIndex === undefined) continue;

        const groupIndex = c.groupIndex;

        if (!map.has(groupIndex)) {
            map.set(groupIndex, { description: '', author: '' });
        }

        const entry = map.get(groupIndex)!;

        if (c.contentType === ContentType.Description) {
            entry.description = c.description || '';
        }

        if (c.contentType === ContentType.Author) {
            entry.author = c.author || '';
        }
    }

    return Array.from(map.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([groupIndex, v]) => ({
            groupIndex,
            description: v.description,
            author: v.author,
        }));
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
    isReplacingTemplate = false,
    onRequestReplace,
}: ProgramSectionFormProps) => {
    const [localSection, setLocalSection] = useState<ProgramSection>(section);
    const [originalSection, setOriginalSection] = useState<ProgramSection>(section);
    const [isDirty, setIsDirty] = useState(false);
    const [validationResetKey, setValidationResetKey] = useState(0);
    const [sectionMode, setSectionMode] = useState<ProgramSectionMode>(
        isNewSection || isReplacingTemplate ? ProgramSectionMode.Edit : ProgramSectionMode.View,
    );
    const sectionModeRef = useRef(sectionMode);
    const onEditStateChangeRef = useRef(onEditStateChange);
    const lastEmittedSectionRef = useRef<ProgramSection | null>(null);
    const localSectionRef = useRef<ProgramSection>(localSection);
    localSectionRef.current = localSection;

    useEffect(() => {
        sectionModeRef.current = sectionMode;
    }, [sectionMode]);

    useEffect(() => {
        onEditStateChangeRef.current = onEditStateChange;
    }, [onEditStateChange]);

    useEffect(() => {
        if (lastEmittedSectionRef.current === section) {
            return;
        }
        setLocalSection(section);
        if (sectionModeRef.current !== ProgramSectionMode.Edit) {
            if (!isReplacingTemplate) {
                setOriginalSection(section);
            }
            setIsDirty(false);
            setSectionMode(isNewSection || isReplacingTemplate ? ProgramSectionMode.Edit : ProgramSectionMode.View);
        }
    }, [section, isNewSection, isReplacingTemplate]);

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

    const isDescriptionAuthorPairsTemplate =
        section.template === ProgramSectionTemplate.SingleTitleDescriptionAuthorPairs;

    const orderedPairs = getDescriptionAuthorPairs(localSection.contents);

    const descriptionAuthorPairs = orderedPairs.map((p) => ({
        description: p.description,
        author: p.author,
    }));

    const imageContents = localSection.contents
        .filter((c) => c.contentType === ContentType.Image)
        .sort((a, b) => a.order - b.order)
        .map((c) => c.image || null);

    const cards = orderedTitleContents.map((t, i) => ({
        title: t.title || '',
        description: orderedDescriptionContents[i]?.description || '',
    }));

    const emitSectionChange = useCallback(
        (updatedSection: ProgramSection) => {
            lastEmittedSectionRef.current = updatedSection;
            setIsDirty(true);
            onSectionChange?.(updatedSection);
        },
        [onSectionChange],
    );

    const handleTitleChange = useCallback(
        (value: string) => {
            const prev = localSectionRef.current;
            const updatedContents = prev.contents.map((c) =>
                c.contentType === ContentType.Title ? { ...c, title: value } : c,
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
            const updatedContents = prev.contents.map((c) =>
                c.contentType === ContentType.Description ? { ...c, description: value } : c,
            );
            const newSection = { ...prev, contents: updatedContents };
            localSectionRef.current = newSection;
            setLocalSection(newSection);
            emitSectionChange(newSection);
        },
        [emitSectionChange],
    );

    const handleDescriptionsChange = useCallback(
        (index: number, value: string) => {
            const prev = localSectionRef.current;
            const ordered = getDescriptionsInOrder(prev.contents);
            const target = ordered[index];
            if (!target) return;

            const updatedContents = prev.contents.map((c) =>
                c.contentType === ContentType.Description && c.order === target.order
                    ? { ...c, description: value }
                    : c,
            );

            const newSection = { ...prev, contents: updatedContents };
            localSectionRef.current = newSection;
            setLocalSection(newSection);
            emitSectionChange(newSection);
        },
        [emitSectionChange],
    );

    const handleCardContentChange = useCallback(
        (index: number, value: string, type: ContentType.Title | ContentType.Description) => {
            const prev = localSectionRef.current;
            const filteredContents = prev.contents
                .filter((c) => c.contentType === type)
                .sort((a, b) => a.order - b.order);

            const target = filteredContents[index];
            if (!target) return;

            const updatedContents = prev.contents.map((c) =>
                c === target ? (type === ContentType.Title ? { ...c, title: value } : { ...c, description: value }) : c,
            );

            const newSection = { ...prev, contents: updatedContents };
            localSectionRef.current = newSection;
            setLocalSection(newSection);
            emitSectionChange(newSection);
        },
        [emitSectionChange],
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
            const prev = localSectionRef.current;
            const imageContentsList = prev.contents.filter((c) => c.contentType === ContentType.Image);
            imageContentsList.sort((a, b) => a.order - b.order);

            if (index >= imageContentsList.length) return;

            const targetOrder = imageContentsList[index].order;
            const newSection = updateImageContent(targetOrder, file, prev);
            localSectionRef.current = newSection;
            setLocalSection(newSection);
            emitSectionChange(newSection);
        },
        [emitSectionChange, updateImageContent],
    );

    const handlePairFieldChange = useCallback(
        (index: number, value: string, field: ContentType.Description | ContentType.Author) => {
            const prev = localSectionRef.current;
            const pairs = getDescriptionAuthorPairs(prev.contents);
            const target = pairs[index];
            if (!target) return;

            const updatedContents = prev.contents.map((c) => {
                if (c.groupIndex !== target.groupIndex || c.contentType !== field) return c;

                if (field === ContentType.Description) {
                    return { ...c, description: value };
                }

                return { ...c, author: value };
            });

            const newSection = { ...prev, contents: updatedContents };
            localSectionRef.current = newSection;
            setLocalSection(newSection);
            emitSectionChange(newSection);
        },
        [emitSectionChange],
    );

    const handlePairDescriptionChange = useCallback(
        (index: number, value: string) => handlePairFieldChange(index, value, ContentType.Description),
        [handlePairFieldChange],
    );

    const handlePairAuthorChange = useCallback(
        (index: number, value: string) => handlePairFieldChange(index, value, ContentType.Author),
        [handlePairFieldChange],
    );

    const handleAddPair = useCallback(() => {
        const prev = localSectionRef.current;
        const groupIndexes = prev.contents
            .map((c) => c.groupIndex)
            .filter((x): x is number => x !== null && x !== undefined);

        const nextGroupIndex = groupIndexes.length ? Math.max(...groupIndexes) + 1 : 0;

        const maxOrder = prev.contents.length ? Math.max(...prev.contents.map((c) => c.order)) : -1;
        const descriptionOrder = maxOrder + 1;
        const authorOrder = maxOrder + 2;

        const newSection: ProgramSection = {
            ...prev,
            contents: [
                ...prev.contents,
                {
                    contentType: ContentType.Description,
                    order: descriptionOrder,
                    groupIndex: nextGroupIndex,
                    description: '',
                },
                {
                    contentType: ContentType.Author,
                    order: authorOrder,
                    groupIndex: nextGroupIndex,
                    author: '',
                },
            ],
        };

        localSectionRef.current = newSection;
        setLocalSection(newSection);
        emitSectionChange(newSection);
    }, [emitSectionChange]);

    const handleDeletePair = useCallback(
        (index: number) => {
            const prev = localSectionRef.current;
            const pairs = getDescriptionAuthorPairs(prev.contents);
            const target = pairs[index];
            if (!target) return;

            const newSection: ProgramSection = {
                ...prev,
                contents: prev.contents.filter((c) => c.groupIndex !== target.groupIndex),
            };

            localSectionRef.current = newSection;
            setLocalSection(newSection);
            emitSectionChange(newSection);
        },
        [emitSectionChange],
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

    //TODO: implement validation
    const canAddPair = true;

    const isCardTemplate = CARD_TEMPLATES.includes(section.template);

    const handleCancelClick = useCallback(() => {
        const shouldRemove = isNewSection;
        const revertTo = originalSection;
        const isTemplateReplacement = isReplacingTemplate;
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
            isTemplateReplacement,
        });
    }, [isDirty, isNewSection, onCancel, originalSection, isReplacingTemplate]);

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

    const handleReplaceClick = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            e.stopPropagation();
            if (onRequestReplace) {
                onRequestReplace();
            }
        },
        [onRequestReplace],
    );

    const editableSection = renderProgramSection({
        templateId: section.template,
        data: {
            title: titleContent?.title || '',
            description,
            descriptions,
            images: imageContents,
            ...(isCardTemplate ? { cards } : {}),
            ...(isDescriptionAuthorPairsTemplate ? { descriptionAuthorPairs } : {}),
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

            ...(isDescriptionAuthorPairsTemplate
                ? {
                      onCardDescriptionChange: handlePairDescriptionChange,
                      onCardAuthorChange: handlePairAuthorChange,
                      onAddPair: handleAddPair,
                      onDeletePair: handleDeletePair,
                      canAddPair,
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
                            onClick={handleReplaceClick}
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
