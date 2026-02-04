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
}: ProgramSectionFormProps) => {
    const [localSection, setLocalSection] = useState<ProgramSection>(section);
    const [originalSection, setOriginalSection] = useState<ProgramSection>(section);
    const [isDirty, setIsDirty] = useState(false);
    const [sectionMode, setSectionMode] = useState<ProgramSectionMode>(
        isNewSection ? ProgramSectionMode.Edit : ProgramSectionMode.View,
    );
    const sectionModeRef = useRef(sectionMode);

    useEffect(() => {
        sectionModeRef.current = sectionMode;
    }, [sectionMode]);

    useEffect(() => {
        setLocalSection(section);
        if (sectionModeRef.current !== ProgramSectionMode.Edit) {
            setOriginalSection(section);
            setIsDirty(false);
            if (!isNewSection) {
                setSectionMode(ProgramSectionMode.View);
            }
        }
    }, [section, isNewSection]);

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
            setLocalSection((prev) => {
                const updatedContents = prev.contents.map((c) =>
                    c.contentType === ContentType.Title ? { ...c, title: value } : c,
                );
                const updatedSection = { ...prev, contents: updatedContents };
                onSectionChange?.(updatedSection);
                setIsDirty(true);
                return updatedSection;
            });
        },
        [onSectionChange],
    );

    const handleDescriptionChange = useCallback(
        (value: string) => {
            setLocalSection((prev) => {
                const updatedContents = prev.contents.map((c) =>
                    c.contentType === ContentType.Description ? { ...c, description: value } : c,
                );
                const updatedSection = { ...prev, contents: updatedContents };
                onSectionChange?.(updatedSection);
                setIsDirty(true);
                return updatedSection;
            });
        },
        [onSectionChange],
    );

    const handleDescriptionsChange = useCallback(
        (index: number, value: string) => {
            setLocalSection((prev) => {
                const ordered = getDescriptionsInOrder(prev.contents);
                const target = ordered[index];
                if (!target) return prev;

                const updatedContents = prev.contents.map((c) =>
                    c.contentType === ContentType.Description && c.order === target.order
                        ? { ...c, description: value }
                        : c,
                );

                const updatedSection = { ...prev, contents: updatedContents };
                onSectionChange?.(updatedSection);
                setIsDirty(true);
                return updatedSection;
            });
        },
        [onSectionChange],
    );

    const handleCardContentChange = useCallback(
        (index: number, value: string, type: ContentType.Title | ContentType.Description) => {
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

                const updatedSection = { ...prev, contents: updatedContents };
                onSectionChange?.(updatedSection);
                setIsDirty(true);
                return updatedSection;
            });
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
            setLocalSection((prev) => {
                const imageContentsList = prev.contents.filter((c) => c.contentType === ContentType.Image);
                imageContentsList.sort((a, b) => a.order - b.order);

                if (index < imageContentsList.length) {
                    const targetOrder = imageContentsList[index].order;
                    const updatedSection = updateImageContent(targetOrder, file, prev);
                    onSectionChange?.(updatedSection);
                    setIsDirty(true);
                    return updatedSection;
                }
                return prev;
            });
        },
        [onSectionChange, updateImageContent],
    );

    const handleEditClick = useCallback(() => {
        setOriginalSection(localSection);
        setIsDirty(false);
        setSectionMode(ProgramSectionMode.Edit);
    }, [localSection]);

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
            }
        };

        onCancel({
            isDirty,
            shouldRemove,
            revertTo,
            onAfterDiscard,
        });
    }, [isDirty, isNewSection, onCancel, originalSection]);

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
            {sectionMode === ProgramSectionMode.View && (
                <div className={styles.hoverButtons}>
                    <Button buttonStyle="secondary" onClick={handleEditClick} className={styles.actionButton}>
                        Edit
                    </Button>
                    <Button buttonStyle="secondary" className={styles.actionButton}>
                        Delete
                    </Button>
                    <Button buttonStyle="secondary" className={styles.actionButton}>
                        Replace
                    </Button>
                </div>
            )}
            <div className={styles.content}>
                {editableSection || (
                    <p className={styles['template-info']}>
                        Template ID: <strong>{section.template}</strong> (not found in renderer)
                    </p>
                )}
            </div>
            <div className={styles.actionsContainer}>
                {sectionMode !== ProgramSectionMode.View && (
                    <div className={styles.actions}>
                        <Button buttonStyle="secondary" onClick={handleCancelClick} disabled={isDisabled}>
                            {PROGRAMS_TEXT.BUTTON.CANCEL}
                        </Button>
                        <Button buttonStyle="primary" onClick={onSave} disabled={true}>
                            {PROGRAMS_TEXT.BUTTON.SAVE}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
