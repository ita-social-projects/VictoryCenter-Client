import { useState, useCallback } from 'react';
import { Button } from '@/components/admin/button/Button';
import { ProgramSection, ProgramSectionContent, ContentType } from '@/types/admin/programs';
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

    const editableSection = renderProgramSection({
        templateId: section.template,
        data: {
            title: titleContent?.title || '',
            description: descriptionContent?.description || '',
        },
        isEditable: true,
        handlers: {
            onTitleChange: handleTitleChange,
            onDescriptionChange: handleDescriptionChange,
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
