import { PDF_FILES_SECTION_TEXT } from '@/const/admin/reports';
import { ReactComponent as EditIcon } from '@/assets/icons/edit-icon.svg';
import styles from './PdfSectionContentBlock.module.scss';
import cn from 'classnames';

interface PdfSectionContent {
    title: string;
    description: string;
}

interface PdfSectionContentBlockProps {
    content: PdfSectionContent;
}

export const PdfSectionContentBlock: React.FC<PdfSectionContentBlockProps> = ({ content }) => {
    return (
        <div className={cn(styles.root, styles['view-root'])}>
            <div className={styles['edit-button-container']}>
                <button
                    aria-label={PDF_FILES_SECTION_TEXT.ACTIONS.EDIT}
                    type="button"
                    onClick={() => {}}
                    className={styles['edit-button']}
                />
            </div>
            <div className={styles['content-container']}>
                <div className={styles['view-field']}>
                    <label className={styles['view-label']}>{PDF_FILES_SECTION_TEXT.VIEW.TITLE}</label>
                    <p className={cn(styles['view-text'], styles['view-text-title'])}>{content.title}</p>
                </div>
                <div className={styles['view-field']}>
                    <label className={styles['view-label']}>{PDF_FILES_SECTION_TEXT.VIEW.DESCRIPTION}</label>
                    <p className={cn(styles['view-text'], styles['view-text-description'])}>{content.description}</p>
                </div>
            </div>
        </div>
    );
};
