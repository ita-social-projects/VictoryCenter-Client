import { useState, useCallback } from 'react';
import { Button } from '@/components/admin/button/Button';
import { ImageValues } from '@/types/common/image';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import { renderProgramSection } from '@/utils/functions/render-program-section';
import styles from './ProgramSectionForm.module.scss';
import { ProgramSection, ProgramSectionContent, ProgramSectionTemplate } from '@/types/common/program-sections';
import { ContentType } from '@/types/common/programs';

export interface ProgramSectionFormProps {
    section: ProgramSection;
    onSave: () => void;
    onCancel: () => void;
    isDisabled?: boolean;
    onSectionChange?: (updatedSection: ProgramSection) => void;
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
}: ProgramSectionFormProps) => {
    const [localSection, setLocalSection] = useState<ProgramSection>(section);

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

    const handleTitleChange = useCallback(
        (value: string) => {
            setLocalSection((prev) => {
                const updatedContents = prev.contents.map((c) =>
                    c.contentType === ContentType.Title ? { ...c, title: value } : c,
                );
                const updatedSection = { ...prev, contents: updatedContents };
                onSectionChange?.(updatedSection);
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
                    return updatedSection;
                }
                return prev;
            });
        },
        [onSectionChange, updateImageContent],
    );

    const handlePairFieldChange = useCallback(
        (index: number, value: string, field: ContentType.Description | ContentType.Author) => {
            setLocalSection((prev) => {
                const pairs = getDescriptionAuthorPairs(prev.contents);
                const target = pairs[index];
                if (!target) return prev;

                const updatedContents = prev.contents.map((c) => {
                    if (c.groupIndex !== target.groupIndex || c.contentType !== field) return c;

                    if (field === ContentType.Description) {
                        return { ...c, description: value };
                    }

                    return { ...c, author: value };
                });

                const updatedSection = { ...prev, contents: updatedContents };
                onSectionChange?.(updatedSection);
                return updatedSection;
            });
        },
        [onSectionChange],
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
        setLocalSection((prev) => {
            const groupIndexes = prev.contents
                .map((c) => c.groupIndex)
                .filter((x): x is number => x !== null && x !== undefined);

            const nextGroupIndex = groupIndexes.length ? Math.max(...groupIndexes) + 1 : 0;

            const maxOrder = prev.contents.length ? Math.max(...prev.contents.map((c) => c.order)) : -1;
            const descriptionOrder = maxOrder + 1;
            const authorOrder = maxOrder + 2;

            const updatedSection: ProgramSection = {
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

            onSectionChange?.(updatedSection);
            return updatedSection;
        });
    }, [onSectionChange]);

    const CARD_TEMPLATES = [
        ProgramSectionTemplate.DualTitleDescription,
        ProgramSectionTemplate.TripleTitleDescription,
        ProgramSectionTemplate.QuadTitleDescription,
    ];

    //TODO: implement validation
    const canAddPair = true;

    const isCardTemplate = CARD_TEMPLATES.includes(section.template);

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
        isEditable: true,
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
                      canAddPair,
                  }
                : {}),
        },
    });

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                {editableSection || (
                    <p className={styles['template-info']}>
                        Template ID: <strong>{section.template}</strong> (not yet implemented)
                    </p>
                )}
            </div>
            <div className={styles.actions}>
                <Button buttonStyle="secondary" onClick={onCancel} disabled={isDisabled}>
                    {PROGRAMS_TEXT.BUTTON.CANCEL}
                </Button>
                <Button buttonStyle="primary" onClick={onSave} disabled={true}>
                    {PROGRAMS_TEXT.BUTTON.SAVE}
                </Button>
            </div>
        </div>
    );
};
