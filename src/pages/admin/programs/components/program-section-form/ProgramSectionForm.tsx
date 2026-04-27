import { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/admin/button/Button';
import { ImageValues } from '@/types/common/image';
import { SECTIONS_TEXT } from '@/const/admin/sections';
import { renderProgramSection } from '@/utils/functions/render-program-section';
import { ReactComponent as ChangeIcon } from '@/assets/icons/change.svg';
import styles from './ProgramSectionForm.module.scss';
import { FaqSectionQuestionDto, CreateHippotherapyProgramSectionDto } from '@/types/common/program-sections';
import { SectionTemplate, SectionMode } from '@/types/common/sections';
import { ContentType } from '@/types/common/section-contents';
import {
    getSectionTemplateMaxGroupCount,
    normalizeGroupedContentsGroupIndexes,
} from '@/utils/functions/section-template-validation/sectionTemplateValidation';
import { PROGRAM_SECTION_VALIDATION_FUNCTIONS } from '@/validation/admin/program-schema/program-schema';
import { getDescriptionAuthorPairsByGroup } from '@/utils/functions/mappers/public/program/get-grouped-program-section-content-pairs';
import {
    getContentByType,
    getDescriptionsInOrder,
    getFaqPairs,
    ensureTitleContentAndOnePair,
} from '@/utils/functions/program-section-content/programSectionContent';
import { IconButton } from '@/components/admin/icon-button/IconButton';
import { ACTION_ICONS } from '@/const/common/action-icons';

export interface ProgramSectionFormProps {
    section: CreateHippotherapyProgramSectionDto;
    onSave: () => void;
    onCancel: (options: SectionCancelOptions) => void;
    isDisabled?: boolean;
    onSectionChange?: (updatedSection: CreateHippotherapyProgramSectionDto) => void;
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
    onRequestSaveSection?: (request: { onConfirm: () => void; onDecline?: () => void }) => void;
}

export interface SectionCancelOptions {
    isDirty: boolean;
    shouldRemove: boolean;
    revertTo: CreateHippotherapyProgramSectionDto;
    onAfterDiscard: () => void;
    isTemplateReplacement?: boolean;
}

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
    onRequestSaveSection,
}: ProgramSectionFormProps) => {
    const [localSection, setLocalSection] = useState<CreateHippotherapyProgramSectionDto>(() =>
        ensureTitleContentAndOnePair(section),
    );
    const [originalSection, setOriginalSection] = useState<CreateHippotherapyProgramSectionDto>(() =>
        ensureTitleContentAndOnePair(section),
    );
    const [isDirty, setIsDirty] = useState(false);
    const [validationResetKey, setValidationResetKey] = useState(0);
    const [sectionMode, setSectionMode] = useState<SectionMode>(
        isNewSection || isReplacingTemplate ? SectionMode.Edit : SectionMode.View,
    );

    const sectionModeRef = useRef(sectionMode);
    const onEditStateChangeRef = useRef(onEditStateChange);
    const lastEmittedSectionRef = useRef<CreateHippotherapyProgramSectionDto | null>(null);
    const localSectionRef = useRef<CreateHippotherapyProgramSectionDto>(localSection);
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

        if (sectionModeRef.current !== SectionMode.Edit) {
            if (!isReplacingTemplate) {
                setOriginalSection(prepared);
            }
            setIsDirty(false);
            setSectionMode(isNewSection || isReplacingTemplate ? SectionMode.Edit : SectionMode.View);
        }

        if (prepared !== section) {
            lastEmittedSectionRef.current = prepared;
            onSectionChange?.(prepared);
        }
    }, [section, isNewSection, isReplacingTemplate, onSectionChange]);

    useEffect(() => {
        onEditStateChangeRef.current?.(sectionMode === SectionMode.Edit);
    }, [sectionMode]);

    const titleContent = getContentByType(localSection.contents, ContentType.Title);

    const orderedTitleContents = localSection.contents
        .filter((c) => c.contentType === ContentType.Title)
        .sort((a, b) => a.order - b.order);

    const orderedDescriptionContents = getDescriptionsInOrder(localSection.contents);

    const descriptions = orderedDescriptionContents.map((c) => (c as any).description || '');
    const description = descriptions[0] || '';

    const isDescriptionAuthorPairsTemplate = section.template === SectionTemplate.SingleTitleDescriptionAuthorPairs;

    const isFaqTemplate = section.template === SectionTemplate.SingleTitleQuestionAnswerPairs;

    const orderedPairs = getDescriptionAuthorPairsByGroup(localSection.contents);

    const descriptionAuthorPairs = orderedPairs.map((p) => ({
        description: p.description,
        author: p.author,
    }));

    const faqPairs: FaqSectionQuestionDto[] = getFaqPairs(localSection.contents).map((p) => ({
        id: p.id ?? undefined,
        questionText: p.questionText,
        answerText: p.answerText,
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
        (updatedSection: CreateHippotherapyProgramSectionDto) => {
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
        (
            order: number,
            file: ImageValues | null,
            prev: CreateHippotherapyProgramSectionDto,
        ): CreateHippotherapyProgramSectionDto => {
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
            const pairs = getDescriptionAuthorPairsByGroup(prev.contents);
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

    const pairsMaxCount = isDescriptionAuthorPairsTemplate ? getSectionTemplateMaxGroupCount(section.template) : 0;

    const validateDescriptionAuthorPairContent = (value: string, type: ContentType) =>
        PROGRAM_SECTION_VALIDATION_FUNCTIONS.validateContentText(value, type, true, section.template);

    const canAddPair =
        !isDescriptionAuthorPairsTemplate ||
        (orderedPairs.length < pairsMaxCount &&
            !validateDescriptionAuthorPairContent((titleContent as any)?.title || '', ContentType.Title) &&
            orderedPairs.every(
                (pair) =>
                    !validateDescriptionAuthorPairContent(pair.description, ContentType.Description) &&
                    !validateDescriptionAuthorPairContent(pair.author, ContentType.Author),
            ));

    const handleAddPair = useCallback(() => {
        const prev = localSectionRef.current;
        if (prev.template !== SectionTemplate.SingleTitleDescriptionAuthorPairs) return;

        const normalizedContents = normalizeGroupedContentsGroupIndexes(prev.contents, [
            ContentType.Description,
            ContentType.Author,
        ]);

        const pairs = getDescriptionAuthorPairsByGroup(normalizedContents);
        const maxGroupCount = getSectionTemplateMaxGroupCount(prev.template);
        if (pairs.length >= maxGroupCount) return;

        const nextGroupIndex = pairs.length;

        const maxOrder = normalizedContents.length ? Math.max(...normalizedContents.map((c) => c.order)) : -1;
        const descriptionOrder = maxOrder + 1;
        const authorOrder = maxOrder + 2;

        const newSection: CreateHippotherapyProgramSectionDto = {
            ...prev,
            contents: [
                ...normalizedContents,
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

        setTimeout(() => {
            const element = document.getElementById(`pair-description-${nextGroupIndex}`) as HTMLTextAreaElement | null;
            element?.focus();
        }, 0);
    }, [emitSectionChange]);

    const performDeletePair = useCallback(
        (index: number) => {
            const prev = localSectionRef.current;
            if (prev.template !== SectionTemplate.SingleTitleDescriptionAuthorPairs) return;

            const pairs = getDescriptionAuthorPairsByGroup(prev.contents);
            if (pairs.length <= 1) return;

            const target = pairs[index];
            if (!target) return;

            const filtered: CreateHippotherapyProgramSectionDto = {
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

    const isSectionSaveValid =
        isSectionValid &&
        (!isFaqTemplate ||
            (faqPairs.length > 0 &&
                faqPairs.every(
                    (pair) =>
                        !PROGRAM_SECTION_VALIDATION_FUNCTIONS.validateFaqQuestion(pair.questionText) &&
                        !PROGRAM_SECTION_VALIDATION_FUNCTIONS.validateFaqAnswer(pair.answerText),
                )));

    const handleFaqQuestionChange = useCallback(
        (index: number, value: string) => {
            const prev = localSectionRef.current;
            const faq = getFaqPairs(prev.contents);
            const target = faq[index];
            if (!target) return;

            const updatedContents = prev.contents.map((c) => {
                if (c.contentType === ContentType.FaqQuestion && c.groupIndex === target.groupIndex) {
                    return {
                        ...c,
                        faqQuestion: { ...c.faqQuestion, questionText: value } as any,
                    };
                }
                return c;
            });

            const newSection = { ...prev, contents: updatedContents };
            localSectionRef.current = newSection;
            setLocalSection(newSection);
            emitSectionChange(newSection);
        },
        [emitSectionChange],
    );

    const handleFaqAnswerChange = useCallback(
        (index: number, value: string) => {
            const prev = localSectionRef.current;
            const faq = getFaqPairs(prev.contents);
            const target = faq[index];
            if (!target) return;

            const updatedContents = prev.contents.map((c) => {
                if (c.contentType === ContentType.FaqQuestion && c.groupIndex === target.groupIndex) {
                    return {
                        ...c,
                        faqQuestion: { ...c.faqQuestion, answerText: value } as any,
                    };
                }
                return c;
            });

            const newSection = { ...prev, contents: updatedContents };
            localSectionRef.current = newSection;
            setLocalSection(newSection);
            emitSectionChange(newSection);
        },
        [emitSectionChange],
    );

    const handleAddFaqPair = useCallback(
        (questionText: string, answerText: string) => {
            const prev = localSectionRef.current;
            if (prev.template !== SectionTemplate.SingleTitleQuestionAnswerPairs) return;

            const faq = getFaqPairs(prev.contents);
            const nextGroupIndex = faq.length;

            const maxOrder = prev.contents.length ? Math.max(...prev.contents.map((c) => c.order)) : -1;

            const newSection: CreateHippotherapyProgramSectionDto = {
                ...prev,
                contents: [
                    ...prev.contents,
                    {
                        contentType: ContentType.FaqQuestion,
                        order: maxOrder + 1,
                        groupIndex: nextGroupIndex,
                        faqQuestion: {
                            questionText,
                            answerText,
                        } as any,
                    } as any,
                ],
            };

            localSectionRef.current = newSection;
            setLocalSection(newSection);
            emitSectionChange(newSection);
        },
        [emitSectionChange],
    );

    const handleDeleteFaqPair = useCallback(
        (index: number) => {
            const prev = localSectionRef.current;
            if (prev.template !== SectionTemplate.SingleTitleQuestionAnswerPairs) return;

            const faq = getFaqPairs(prev.contents);
            if (faq.length <= 1) return;

            const target = faq[index];
            if (!target) return;

            const filtered: CreateHippotherapyProgramSectionDto = {
                ...prev,
                contents: prev.contents.filter(
                    (c) => !(c.contentType === ContentType.FaqQuestion && c.groupIndex === target.groupIndex),
                ),
            };

            const normalizedContents = filtered.contents.map((c) => {
                if (c.contentType === ContentType.FaqQuestion && c.groupIndex !== null && c.groupIndex !== undefined) {
                    if (c.groupIndex > target.groupIndex) {
                        return { ...c, groupIndex: c.groupIndex - 1 };
                    }
                }
                return c;
            });

            const normalizedSection = { ...filtered, contents: normalizedContents };

            localSectionRef.current = normalizedSection;
            setLocalSection(normalizedSection);
            emitSectionChange(normalizedSection);
        },
        [emitSectionChange],
    );

    const handleEditClick = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            e.stopPropagation();
            setOriginalSection(localSection);
            setIsDirty(false);
            setSectionMode(SectionMode.Edit);
        },
        [localSection],
    );

    const CARD_TEMPLATES = [
        SectionTemplate.DualTitleDescriptionPairs,
        SectionTemplate.TripleTitleDescriptionPairs,
        SectionTemplate.QuadTitleDescriptionPairs,
    ];

    const isCardTemplate = CARD_TEMPLATES.includes(section.template);

    const performCancel = useCallback(
        (forceCleanState: boolean) => {
            const shouldRemove = isNewSection;
            const revertTo = originalSection;
            const isTemplateReplacement = isReplacingTemplate;

            const onAfterDiscard = () => {
                if (!shouldRemove) {
                    localSectionRef.current = revertTo;
                    setLocalSection(revertTo);
                    setIsDirty(false);
                    setSectionMode(SectionMode.View);
                    setValidationResetKey((prev) => prev + 1);
                }
            };

            onCancel({
                isDirty: forceCleanState ? false : isDirty,
                shouldRemove,
                revertTo,
                onAfterDiscard,
                isTemplateReplacement,
            });
        },
        [isDirty, isNewSection, onCancel, originalSection, isReplacingTemplate],
    );

    const handleCancelClick = useCallback(() => {
        performCancel(false);
    }, [performCancel]);

    const handleDeclineSave = useCallback(() => {
        performCancel(true);
    }, [performCancel]);

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

    const handleSaveClick = useCallback(() => {
        if (isDisabled || !isSectionSaveValid) return;

        const applySave = () => {
            onSave();
            setOriginalSection(localSection);
            setIsDirty(false);
            setSectionMode(SectionMode.View);
            setValidationResetKey((prev) => prev + 1);
        };

        if (onRequestSaveSection && isDirty) {
            onRequestSaveSection({ onConfirm: applySave, onDecline: handleDeclineSave });
            return;
        }

        applySave();
    }, [isDisabled, isSectionSaveValid, onSave, localSection, onRequestSaveSection, isDirty, handleDeclineSave]);

    const editableSection = renderProgramSection({
        templateId: section.template,
        data: {
            title: (titleContent as any)?.title || '',
            description,
            descriptions,
            images: imageContents,
            ...(isCardTemplate ? { cards } : {}),
            ...(isDescriptionAuthorPairsTemplate ? { descriptionAuthorPairs } : {}),
            ...(isFaqTemplate ? { faqPairs } : {}),
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
            {sectionMode === SectionMode.View && (
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
                        <IconButton
                            type="button"
                            onClick={handleEditClick}
                            className={`${styles['icon-button']} ${styles['edit-button']}`}
                            aria-label="Edit section"
                            DefaultIcon={ACTION_ICONS.edit.default}
                            FilledIcon={ACTION_ICONS.edit.hover}
                        />
                        <IconButton
                            type="button"
                            onClick={handleDeleteClick}
                            className={`${styles['icon-button']} ${styles['delete-button']}`}
                            aria-label="Delete section"
                            DefaultIcon={ACTION_ICONS.delete.default}
                            FilledIcon={ACTION_ICONS.delete.hover}
                        />
                        <button
                            type="button"
                            onClick={handleReplaceClick}
                            className={`${styles['icon-button']} ${styles['change-button']}`}
                            aria-label="Replace section"
                        >
                            <ChangeIcon />
                        </button>
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
                {sectionMode !== SectionMode.View && (
                    <div className={styles.actions}>
                        <Button buttonStyle="secondary" onClick={handleCancelClick} disabled={isDisabled}>
                            {SECTIONS_TEXT.BUTTON.CANCEL}
                        </Button>
                        <Button
                            buttonStyle="primary"
                            onClick={handleSaveClick}
                            disabled={!isDirty || isDisabled || !isSectionSaveValid}
                        >
                            {SECTIONS_TEXT.BUTTON.SAVE}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
