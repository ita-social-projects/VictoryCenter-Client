import { useState, useCallback } from 'react';
import { Button } from '@/components/admin/button/Button';
import { ImageValues } from '@/types/common/image';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import { renderProgramSection } from '@/utils/functions/render-program-section';
import styles from './ProgramSectionForm.module.scss';
import { ProgramSection, ProgramSectionContent } from '@/types/common/program-sections';
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

export const ProgramSectionForm = ({
    section,
    onSave,
    onCancel,
    isDisabled = false,
    onSectionChange,
}: ProgramSectionFormProps) => {
    const [localSection, setLocalSection] = useState<ProgramSection>(section);

    const titleContent = getContentByType(localSection.contents, ContentType.Title);
    const descriptionContent = getContentByType(localSection.contents, ContentType.Description);

    const imageContents = localSection.contents
        .filter((c) => c.contentType === ContentType.Image)
        .sort((a, b) => a.order - b.order)
        .map((c) => c.image || null);

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

    const editableSection = renderProgramSection({
        templateId: section.template,
        data: {
            title: titleContent?.title || '',
            description: descriptionContent?.description || '',
            images: imageContents,
        },
        isEditable: true,
        handlers: {
            onTitleChange: handleTitleChange,
            onDescriptionChange: handleDescriptionChange,
            onImagesChange: handleImagesChange,
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
