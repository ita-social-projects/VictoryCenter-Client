import { useState, useCallback } from 'react';
import { Button } from '@/components/admin/button/Button';
import { ProgramSection, ProgramSectionContent, ContentType } from '@/types/admin/programs';
import { ImageValues } from '@/types/common/image';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import { renderProgramSection } from '@/utils/functions/render-program-section';
import styles from './ProgramSectionForm.module.scss';

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

const getImageContentByOrder = (
    contents: ProgramSectionContent[],
    order: number,
): ProgramSectionContent | undefined => {
    const imageContents = contents.filter((c) => c.contentType === ContentType.Image);
    return imageContents.find((c) => c.order === order);
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
    const image1Content = getImageContentByOrder(localSection.contents, 2);
    const image2Content = getImageContentByOrder(localSection.contents, 3);
    const image3Content = getImageContentByOrder(localSection.contents, 4);
    const image4Content = getImageContentByOrder(localSection.contents, 5);

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

    const handleImageChange = useCallback(
        (order: number) => (file: ImageValues | null) => {
            setLocalSection((prev) => {
                const updatedSection = updateImageContent(order, file, prev);
                onSectionChange?.(updatedSection);
                return updatedSection;
            });
        },
        [onSectionChange, updateImageContent],
    );

    const editableSection = renderProgramSection({
        templateId: section.template,
        data: {
            title: titleContent?.title || '',
            description: descriptionContent?.description || '',
            image1: image1Content?.image && 'url' in image1Content.image ? image1Content.image.url : undefined,
            image2: image2Content?.image && 'url' in image2Content.image ? image2Content.image.url : undefined,
            image3: image3Content?.image && 'url' in image3Content.image ? image3Content.image.url : undefined,
            image4: image4Content?.image && 'url' in image4Content.image ? image4Content.image.url : undefined,
        },
        isEditable: true,
        handlers: {
            onTitleChange: handleTitleChange,
            onDescriptionChange: handleDescriptionChange,
            onImage1Change: handleImageChange(2),
            onImage2Change: handleImageChange(3),
            onImage3Change: handleImageChange(4),
            onImage4Change: handleImageChange(5),
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
