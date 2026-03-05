import { PDF_FILES_SECTION_TEXT } from '@/const/admin/reports';
import styles from './PdfSectionContentBlock.module.scss';
import cn from 'classnames';

interface PdfSectionContent {
    title: string;
    description: string;
}

interface PdfSectionContentBlockProps {
    content: PdfSectionContent;
    isEditing: boolean;
}

export const PdfSectionContentBlock: React.FC<PdfSectionContentBlockProps> = ({ content, isEditing }) => {
    if (isEditing) {
        return <div></div>;
    }

    return (
        <div className={cn(styles.root, styles['view-root'])}>
            <div className={styles['view-field']}>
                <label className={styles['view-label']}>{PDF_FILES_SECTION_TEXT.VIEW.TITLE}</label>
                <p className={cn(styles['view-text'], styles['view-text-title'])}>{content.title}</p>
            </div>
            <div className={styles['view-field']}>
                <label className={styles['view-label']}>{PDF_FILES_SECTION_TEXT.VIEW.DESCRIPTION}</label>
                <p className={cn(styles['view-text'], styles['view-text-description'])}>{content.description}</p>
            </div>
        </div>
    );
};
