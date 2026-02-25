import React from 'react';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { PDF_FILES_SECTION_VALIDATION, PDF_FILES_SECTION_TEXT } from '@/const/admin/reports';
import styles from './PdfSectionContentBlock.module.scss';

interface PdfSectionContent {
    title: string;
    description: string;
}

interface PdfSectionContentBlockProps {
    content: PdfSectionContent;
    isEditing: boolean;
    onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const PdfSectionContentBlock: React.FC<PdfSectionContentBlockProps> = ({
    content,
    isEditing,
    onTitleChange,
    onDescriptionChange,
}) => {
    if (isEditing) {
        return (
            <div className={styles.root}>
                <div className={styles.field}>
                    <InputWithCharacterLimitGroup
                        label={PDF_FILES_SECTION_TEXT.FORM.LABEL.TITLE}
                        isRequired={true}
                        id="pdf-section-title"
                        name="pdf-section-title"
                        value={content.title}
                        onChange={onTitleChange}
                        maxLength={PDF_FILES_SECTION_VALIDATION.title.max}
                        disabled={false}
                    />
                </div>
                <div className={styles.field}>
                    <TextAreaWithCharacterLimitGroup
                        label={PDF_FILES_SECTION_TEXT.FORM.LABEL.DESCRIPTION}
                        isRequired={true}
                        id="pdf-section-description"
                        name="pdf-section-description"
                        value={content.description}
                        onChange={onDescriptionChange}
                        maxLength={PDF_FILES_SECTION_VALIDATION.description.max}
                        disabled={false}
                        rows={4}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className={styles.root}>
            <div className={styles['view-field']}>
                <label className={styles['view-label']}>{PDF_FILES_SECTION_TEXT.FORM.LABEL.TITLE}</label>
                <p className={styles['view-text']}>{content.title}</p>
            </div>
            <div className={styles['view-field']}>
                <label className={styles['view-label']}>{PDF_FILES_SECTION_TEXT.FORM.LABEL.DESCRIPTION}</label>
                <p className={styles['view-text']}>{content.description}</p>
            </div>
        </div>
    );
};
