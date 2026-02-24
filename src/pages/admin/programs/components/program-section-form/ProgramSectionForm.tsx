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
import {
    getProgramSectionTemplateMaxGroupCount,
    normalizeGroupedContentsGroupIndexes,
} from '@/utils/functions/program-section-template-validation/programSectionTemplateValidation';
import { PROGRAM_SECTION_VALIDATION_FUNCTIONS } from '@/validation/admin/program-schema/program-schema';

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
    isFirstSection: boolean;
    isLastSection: boolean;
    onMoveUpSection: () => void;
    onMoveDownSection: () => void;
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

    for (const content of contents) {
        if (content.groupIndex === null || content.groupIndex === undefined) continue;

        const groupIndex = content.groupIndex;

        if (!map.has(groupIndex)) {
            map.set(groupIndex, { description: '', author: '' });
        }

        const entry = map.get(groupIndex)!;

        if (content.contentType === ContentType.Description) {
            entry.description = (content as any).description || '';
        }

        if (content.contentType === ContentType.Author) {
            entry.author = (content as any).author || '';
        }
    }

    return Array.from(map.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([groupIndex, value]) => ({
            groupIndex,
            description: value.description,
            author: value.author,
        }));
};

const ensureTitleContentAndOnePair = (section: ProgramSection): ProgramSection => {
    if (section.template !== ProgramSectionTemplate.SingleTitleDescriptionAuthorPairs) return section;

    let updatedContents = section.contents;
    let hasChanges = false;

    const hasTitleContent = updatedContents.some((c) => c.contentType === ContentType.Title);

    if (!hasTitleContent) {
        const maxOrder = updatedContents.length ? Math.max(...updatedContents.map((c) => c.order)) : -1;

        updatedContents = [
            ...updatedContents,
            {
                contentType: ContentType.Title,
                order: maxOrder + 1,
                title: '',
            } as any,
        ];

        hasChanges = true;
    }

    const pairs = getDescriptionAuthorPairs(updatedContents);
    if (pairs.length > 0) {
        return hasChanges ? { ...section, contents: updatedContents } : section;
    }

    const maxOrder = updatedContents.length ? Math.max(...updatedContents.map((c) => c.order)) : -1;

    updatedContents = [
        ...updatedContents,
        {
            contentType: ContentType.Description,
            order: maxOrder + 1,
            groupIndex: 0,
            description: '',
        } as any,
        {
            contentType: ContentType.Author,
            order: maxOrder + 2,
            groupIndex: 0,
            author: '',
        } as any,
    ];

    return { ...section, contents: updatedContents };
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
    isFirstSection = false,
    isLastSection = false,
    onMoveDownSection,
    onMoveUpSection,
}: ProgramSectionFormProps) => {
    const [localSection, setLocalSection] = useState<ProgramSection>(() => ensureTitleContentAndOnePair(section));
    const [originalSection, setOriginalSection] = useState<ProgramSection>(() => ensureTitleContentAndOnePair(section));
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
        if (lastEmittedSectionRef.current === section) return;

        const shouldPrepare = isNewSection || isReplacingTemplate;
        const prepared = shouldPrepare ? ensureTitleContentAndOnePair(section) : section;

        setLocalSection(prepared);
        localSectionRef.current = prepared;

        if (sectionModeRef.current !== ProgramSectionMode.Edit) {
            if (!isReplacingTemplate) {
                setOriginalSection(prepared);
            }
            setIsDirty(false);
            setSectionMode(isNewSection || isReplacingTemplate ? ProgramSectionMode.Edit : ProgramSectionMode.View);
        }

        if (prepared !== section) {
            lastEmittedSectionRef.current = prepared;
            onSectionChange?.(prepared);
        }
    }, [section, isNewSection, isReplacingTemplate, onSectionChange]);

    useEffect(() => {
        onEditStateChangeRef.current?.(sectionMode === ProgramSectionMode.Edit);
    }, [sectionMode]);

    const titleContent = getContentByType(localSection.contents, ContentType.Title);

    const orderedTitleContents = localSection.contents
        .filter((c) => c.contentType === ContentType.Title)
        .sort((a, b) => a.order - b.order);

    const orderedDescriptionContents = getDescriptionsInOrder(localSection.contents);

    const descriptions = orderedDescriptionContents.map((c) => (c as any).description || '');
    const description = descriptions[0] || '';

    const isDescriptionAuthorPairsTemplate =
        section.template === ProgramSectionTemplate.SingleTitleDescriptionAuthorPairs;

    const isFaqTemplate = section.template === ProgramSectionTemplate.SingleTitleQuestionAnswerPairs;

    const orderedPairs = getDescriptionAuthorPairs(localSection.contents);

    const descriptionAuthorPairs = orderedPairs.map((p) => ({
        description: p.description,
        author: p.author,
    }));

    const imageContents = localSection.contents
        .filter((c) => c.contentType === ContentType.Image)
        .sort((a, b) => a.order - b.order)
        .map((c) => (c as any).image || null);

    const cards = orderedTitleContents.map((t, i) => ({
        title: (t as any).title || '',
        description: (orderedDescriptionContents[i] as any)?.description || '',
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
                c.contentType === ContentType.Title ? ({ ...c, title: value } as any) : c,
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
                c.contentType === ContentType.Description ? ({ ...c, description: value } as any) : c,
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
                    ? ({ ...c, description: value } as any)
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
                c === target
                    ? type === ContentType.Title
                        ? ({ ...c, title: value } as any)
                        : ({ ...c, description: value } as any)
                    : c,
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
                c.contentType === ContentType.Image && c.order === order ? ({ ...c, image: file } as any) : c,
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
                    return { ...c, description: value } as any;
                }

                return { ...c, author: value } as any;
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

    const pairsMaxCount = isDescriptionAuthorPairsTemplate
        ? getProgramSectionTemplateMaxGroupCount(section.template)
        : 0;
    const canAddPair = isDescriptionAuthorPairsTemplate ? orderedPairs.length < pairsMaxCount : true;

    const handleAddPair = useCallback(() => {
        const prev = localSectionRef.current;
        if (prev.template !== ProgramSectionTemplate.SingleTitleDescriptionAuthorPairs) return;

        const pairs = getDescriptionAuthorPairs(prev.contents);
        const maxGroupCount = getProgramSectionTemplateMaxGroupCount(prev.template);
        if (pairs.length >= maxGroupCount) return;

        const nextGroupIndex = pairs.length;

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
                } as any,
                {
                    contentType: ContentType.Author,
                    order: authorOrder,
                    groupIndex: nextGroupIndex,
                    author: '',
                } as any,
            ],
        };

        localSectionRef.current = newSection;
        setLocalSection(newSection);
        emitSectionChange(newSection);

        const nextIndex = pairs.length;
        setTimeout(() => {
            const element = document.getElementById(`pair-description-${nextIndex}`) as HTMLTextAreaElement | null;
            element?.focus();
        }, 0);
    }, [emitSectionChange]);

    const performDeletePair = useCallback(
        (index: number) => {
            const prev = localSectionRef.current;
            if (prev.template !== ProgramSectionTemplate.SingleTitleDescriptionAuthorPairs) return;

            const pairs = getDescriptionAuthorPairs(prev.contents);
            if (pairs.length <= 1) return;

            const target = pairs[index];
            if (!target) return;

            const filtered: ProgramSection = {
                ...prev,
                contents: prev.contents.filter((c) => c.groupIndex !== target.groupIndex),
            };

            const normalizedContents = normalizeGroupedContentsGroupIndexes(filtered.contents, [
                ContentType.Description,
                ContentType.Author,
            ]);

            const normalizedSection = { ...filtered, contents: normalizedContents };

            localSectionRef.current = normalizedSection;
            setLocalSection(normalizedSection);
            emitSectionChange(normalizedSection);
        },
        [emitSectionChange],
    );

    const [faqPairs, setFaqPairs] = useState<Array<{ questionText: string; answerText: string }>>([]);

    const isSectionSaveValid =
        isSectionValid &&
        (!isFaqTemplate ||
            (faqPairs.length > 0 &&
                faqPairs.every(
                    (pair) =>
                        !PROGRAM_SECTION_VALIDATION_FUNCTIONS.validateFaqQuestion(pair.questionText) &&
                        !PROGRAM_SECTION_VALIDATION_FUNCTIONS.validateFaqAnswer(pair.answerText),
                )));

    const handleFaqQuestionChange = useCallback((index: number, value: string) => {
        setFaqPairs((prev) => prev.map((p, i) => (i === index ? { ...p, questionText: value } : p)));
        setIsDirty(true);
    }, []);

    const handleFaqAnswerChange = useCallback((index: number, value: string) => {
        setFaqPairs((prev) => prev.map((p, i) => (i === index ? { ...p, answerText: value } : p)));
        setIsDirty(true);
    }, []);

    const handleAddFaqPair = useCallback((questionText: string, answerText: string) => {
        setFaqPairs((prev) => [...prev, { questionText, answerText }]);
        setIsDirty(true);
    }, []);

    const handleDeleteFaqPair = useCallback((index: number) => {
        setFaqPairs((prev) => prev.filter((_, i) => i !== index));
        setIsDirty(true);
    }, []);

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
        if (isDisabled || !isSectionSaveValid) return;
        onSave();
        setOriginalSection(localSection);
        setIsDirty(false);
        setSectionMode(ProgramSectionMode.View);
        setValidationResetKey((prev) => prev + 1);
    }, [isDisabled, isSectionSaveValid, onSave, localSection]);

    const CARD_TEMPLATES = [
        ProgramSectionTemplate.DualTitleDescriptionPairs,
        ProgramSectionTemplate.TripleTitleDescriptionPairs,
        ProgramSectionTemplate.QuadTitleDescriptionPairs,
    ];

    const isCardTemplate = CARD_TEMPLATES.includes(section.template);

    const handleCancelClick = useCallback(() => {
        const shouldRemove = isNewSection;
        const revertTo = originalSection;
        const isTemplateReplacement = isReplacingTemplate;

        const onAfterDiscard = () => {
            if (!shouldRemove) {
                localSectionRef.current = revertTo;
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
            onDelete?.();
        },
        [onDelete],
    );

    const handleReplaceClick = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            e.stopPropagation();
            onRequestReplace?.();
        },
        [onRequestReplace],
    );

    const editableSection = renderProgramSection({
        templateId: section.template,
        data: {
            title: (titleContent as any)?.title || '',
            description,
            descriptions,
            images: imageContents,
            ...(isCardTemplate ? { cards } : {}),
            ...(isDescriptionAuthorPairsTemplate ? { descriptionAuthorPairs } : {}),
            ...(isFaqTemplate ? { faqPairs: faqPairs as any } : {}),
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
                      onDeletePair: performDeletePair,
                      canAddPair,
                  }
                : {}),
            ...(isFaqTemplate
                ? {
                      onFaqQuestionChange: handleFaqQuestionChange,
                      onFaqAnswerChange: handleFaqAnswerChange,
                      onAddFaqPair: handleAddFaqPair,
                      onDeleteFaqPair: handleDeleteFaqPair,
                  }
                : {}),
        },
    });

    return (
        <div className={styles.container}>
            {sectionMode === ProgramSectionMode.View && (
                <div className={styles['actions-section']}>
                    <div className={styles['order-controls']}>
                        <div className={styles['order-controls']}>
                            {!isFirstSection && (
                                <button
                                    type="button"
                                    onClick={onMoveUpSection}
                                    className={`${styles['icon-button']} ${styles['up-button']}`}
                                    aria-label="Move up section"
                                />
                            )}
                            {!isLastSection && (
                                <button
                                    type="button"
                                    onClick={onMoveDownSection}
                                    className={`${styles['icon-button']} ${styles['down-button']}`}
                                    aria-label="Move down section"
                                />
                            )}
                        </div>
                    </div>
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
                </div>
            )}
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
                            disabled={isDisabled || !isSectionSaveValid}
                        >
                            {PROGRAMS_TEXT.BUTTON.SAVE}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
