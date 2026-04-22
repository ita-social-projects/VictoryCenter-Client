import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { SectionCancelActionType } from '@/types/admin/programs';
import { HistorySectionDto } from '@/types/common/history-sections';
import { isHistoryTemplate } from '@/utils/functions/render-history-section';
import {
    createSectionDiscardAction,
    requestSectionCancel,
    requestSectionDelete,
} from '@/utils/functions/section-cancel-flow/section-cancel-flow';
import { HistorySectionForm, SectionCancelOptions } from '../history-section-form/HistorySectionForm';
import styles from './HistoryForm.module.scss';

interface SectionEditingState {
    sectionKey: string;
    isSaved: boolean;
    isEditing: boolean;
    isNew: boolean;
    isReplacing: boolean;
}

export interface HistoryFormRef {
    addSection: (section: HistorySectionDto) => void;
    replaceSection: (sectionIndex: number, newSection: HistorySectionDto) => void;
    getSections: () => HistorySectionDto[];
}

export interface HistoryFormProps {
    sections: HistorySectionDto[];
    isFormDisabled?: boolean;
    onReplaceSection?: (sectionIndex: number) => void;
    onSectionsChange?: (sections: HistorySectionDto[]) => void;
    onSectionSaved?: () => void;
    onSectionDeleted?: (remainingSections: HistorySectionDto[]) => void;
    onRequestCancelSection?: (request: { type: SectionCancelActionType; onDiscard: () => void }) => void;
    onRequestSaveSection?: (request: { onConfirm: () => void }) => void;
}

const createSectionState = (sectionKey: string): SectionEditingState => ({
    sectionKey,
    isSaved: true,
    isEditing: false,
    isNew: false,
    isReplacing: false,
});

const getSectionsSyncSignature = (sections: HistorySectionDto[]): string => {
    return sections.map((section) => `${section.id}:${section.order}`).join('|');
};

export const HistoryForm = forwardRef<HistoryFormRef, HistoryFormProps>(function HistoryForm(
    {
        sections,
        isFormDisabled = false,
        onReplaceSection,
        onSectionsChange,
        onSectionSaved,
        onSectionDeleted,
        onRequestCancelSection,
        onRequestSaveSection,
    },
    ref,
) {
    const [localSections, setLocalSections] = useState<HistorySectionDto[]>(sections);
    const [sectionStates, setSectionStates] = useState<SectionEditingState[]>(() => {
        return sections.map((_, index) => createSectionState(`history-section-${index + 1}`));
    });

    const sectionsContainerRef = useRef<HTMLDivElement>(null);
    const sectionStatesRef = useRef(sectionStates);
    const nextSectionKeyRef = useRef(sections.length);
    const lastSectionsSyncSignatureRef = useRef(getSectionsSyncSignature(sections));

    sectionStatesRef.current = sectionStates;
    const localSectionsRef = useRef(localSections);

    useEffect(() => {
        const nextSectionsSyncSignature = getSectionsSyncSignature(sections);
        if (lastSectionsSyncSignatureRef.current === nextSectionsSyncSignature) {
            return;
        }

        lastSectionsSyncSignatureRef.current = nextSectionsSyncSignature;

        setLocalSections(sections);
        localSectionsRef.current = sections;
        setSectionStates((prev) => {
            if (prev.length === sections.length) return prev;

            if (prev.length > sections.length) {
                return prev.slice(0, sections.length);
            }
            const additional = Array.from({ length: sections.length - prev.length }, () => {
                nextSectionKeyRef.current += 1;
                const sectionKey = `history-section-${nextSectionKeyRef.current}`;
                return {
                    sectionKey,
                    isSaved: false,
                    isEditing: true,
                    isNew: true,
                    isReplacing: false,
                };
            });

            return [...prev, ...additional];
        });
    }, [sections]);

    useImperativeHandle(
        ref,
        () => ({
            addSection(section: HistorySectionDto) {
                nextSectionKeyRef.current += 1;
                const sectionKey = `history-section-${nextSectionKeyRef.current}`;
                const newSections = [...localSectionsRef.current, section];
                localSectionsRef.current = newSections;
                setLocalSections(newSections);
                setSectionStates((prev) => [
                    ...prev,
                    {
                        sectionKey,
                        isSaved: false,
                        isEditing: true,
                        isNew: true,
                        isReplacing: false,
                    },
                ]);
            },
            replaceSection(sectionIndex: number, newSection: HistorySectionDto) {
                const newSections = [...localSectionsRef.current];
                if (sectionIndex < 0 || sectionIndex >= newSections.length) {
                    return;
                }
                newSections[sectionIndex] = newSection;
                localSectionsRef.current = newSections;
                setLocalSections(newSections);
                setSectionStates((prev) =>
                    prev.map((state, index) =>
                        index === sectionIndex
                            ? { ...state, isSaved: false, isEditing: true, isNew: false, isReplacing: true }
                            : state,
                    ),
                );
            },
            getSections() {
                return localSectionsRef.current;
            },
        }),
        [],
    );

    const sectionValidity = useMemo(
        () => localSections.map((section) => isHistoryTemplate(section.template)),
        [localSections],
    );

    const updateSectionState = useCallback(
        (sectionKey: string, updates: Partial<Omit<SectionEditingState, 'sectionKey'>>) => {
            setSectionStates((prev) =>
                prev.map((state) => (state.sectionKey === sectionKey ? { ...state, ...updates } : state)),
            );
        },
        [],
    );

    const updateSections = useCallback(
        (updater: (prev: HistorySectionDto[]) => HistorySectionDto[]) => {
            const updatedSections = updater(localSectionsRef.current);
            localSectionsRef.current = updatedSections;
            setLocalSections(updatedSections);
            onSectionsChange?.(updatedSections);
        },
        [onSectionsChange],
    );

    const getSectionIndex = useCallback((sectionKey: string) => {
        return sectionStatesRef.current.findIndex((state) => state.sectionKey === sectionKey);
    }, []);

    const handleSaveSection = useCallback(
        (sectionKey: string) => {
            updateSectionState(sectionKey, { isSaved: true, isNew: false, isReplacing: false });
            onSectionSaved?.();
        },
        [updateSectionState, onSectionSaved],
    );

    const handleSectionChange = useCallback(
        (sectionKey: string, updatedSection: HistorySectionDto) => {
            const index = getSectionIndex(sectionKey);
            if (index === -1) {
                return;
            }

            updateSections((prev) => {
                if (!prev[index]) {
                    return prev;
                }

                const next = [...prev];
                next[index] = updatedSection;
                return next;
            });

            updateSectionState(sectionKey, { isSaved: false });
        },
        [getSectionIndex, updateSectionState, updateSections],
    );

    const handleRemoveSection = useCallback(
        (sectionKey: string) => {
            const index = getSectionIndex(sectionKey);
            if (index === -1) {
                return;
            }

            updateSections((prev) => prev.filter((_, sectionIndex) => sectionIndex !== index));
            setSectionStates((prev) => prev.filter((state) => state.sectionKey !== sectionKey));
            onSectionDeleted?.(localSectionsRef.current);
        },
        [getSectionIndex, onSectionDeleted, updateSections],
    );

    const handleCancelSection = useCallback(
        (sectionKey: string, options: SectionCancelOptions) => {
            const discard = createSectionDiscardAction({
                shouldRemove: options.shouldRemove,
                revertTo: options.revertTo,
                onRemove: () => {
                    handleRemoveSection(sectionKey);
                },
                onRevert: (sectionToRevert) => {
                    handleSectionChange(sectionKey, sectionToRevert);
                    updateSectionState(sectionKey, {
                        isSaved: true,
                        isEditing: false,
                        isNew: false,
                        isReplacing: false,
                    });
                },
                onAfterDiscard: options.onAfterDiscard,
            });

            requestSectionCancel({
                shouldRemove: options.shouldRemove,
                isDirty: options.isDirty,
                isTemplateReplacement: options.isTemplateReplacement,
                onDiscard: discard,
                onRequestCancelSection,
            });
        },
        [handleRemoveSection, handleSectionChange, onRequestCancelSection, updateSectionState],
    );

    const handleDeleteSection = useCallback(
        (sectionKey: string) => {
            requestSectionDelete({
                onDiscard: () => {
                    handleRemoveSection(sectionKey);
                },
                onRequestCancelSection,
            });
        },
        [handleRemoveSection, onRequestCancelSection],
    );

    const handleSectionEditStateChange = useCallback(
        (sectionKey: string, isEditing: boolean) => {
            updateSectionState(sectionKey, { isEditing });
        },
        [updateSectionState],
    );

    const handleMoveUpSection = useCallback(
        (sectionKey: string) => {
            const index = getSectionIndex(sectionKey);
            if (index <= 0) {
                return;
            }

            updateSections((prev) => {
                const next = [...prev];
                [next[index - 1], next[index]] = [next[index], next[index - 1]];
                return next;
            });

            setSectionStates((prev) => {
                const next = [...prev];
                [next[index - 1], next[index]] = [next[index], next[index - 1]];
                return next;
            });

            setTimeout(() => {
                sectionsContainerRef.current
                    ?.querySelector(`[data-section-key="${sectionKey}"]`)
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 50);
        },
        [getSectionIndex, updateSections],
    );

    const handleMoveDownSection = useCallback(
        (sectionKey: string) => {
            const index = getSectionIndex(sectionKey);
            if (index < 0 || index >= sectionStatesRef.current.length - 1) {
                return;
            }

            updateSections((prev) => {
                const next = [...prev];
                [next[index], next[index + 1]] = [next[index + 1], next[index]];
                return next;
            });

            setSectionStates((prev) => {
                const next = [...prev];
                [next[index], next[index + 1]] = [next[index + 1], next[index]];
                return next;
            });

            setTimeout(() => {
                sectionsContainerRef.current
                    ?.querySelector(`[data-section-key="${sectionKey}"]`)
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 50);
        },
        [getSectionIndex, updateSections],
    );

    if (!localSections.length) {
        return null;
    }

    return (
        <div className={styles['sections-list']} ref={sectionsContainerRef}>
            {localSections.map((section, index) => {
                const sectionState = sectionStates[index];
                if (!sectionState) {
                    return null;
                }

                const { sectionKey } = sectionState;

                return (
                    <React.Fragment key={sectionKey}>
                        <HistorySectionForm
                            section={section}
                            sectionKey={sectionKey}
                            onSave={() => handleSaveSection(sectionKey)}
                            onCancel={(options) => handleCancelSection(sectionKey, options)}
                            onSectionChange={(updatedSection) => handleSectionChange(sectionKey, updatedSection)}
                            isDisabled={isFormDisabled}
                            isNewSection={sectionState.isNew}
                            isSectionValid={sectionValidity[index] ?? false}
                            onEditStateChange={(isEditing) => handleSectionEditStateChange(sectionKey, isEditing)}
                            onDelete={() => handleDeleteSection(sectionKey)}
                            isReplacingTemplate={sectionState.isReplacing}
                            onRequestReplace={() => onReplaceSection?.(index)}
                            isFirstSection={index === 0}
                            isLastSection={index === localSections.length - 1}
                            onMoveUpSection={() => handleMoveUpSection(sectionKey)}
                            onMoveDownSection={() => handleMoveDownSection(sectionKey)}
                            onRequestSaveSection={onRequestSaveSection}
                        />
                        <div className={styles['sections-divider']} />
                    </React.Fragment>
                );
            })}
        </div>
    );
});
