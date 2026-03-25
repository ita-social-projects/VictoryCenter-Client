import { PDF_FILES_SECTION_TEXT } from '@/const/admin/reports';
import styles from './PdfSectionContentBlock.module.scss';
import cn from 'classnames';
import { ACTION_ICONS } from '@/const/common/action-icons';
import { IconButton } from '@/components/admin/icon-button/IconButton';

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
                <IconButton
                    aria-label={PDF_FILES_SECTION_TEXT.ACTIONS.EDIT}
                    type="button"
                    onClick={() => {}}
                    className={styles['edit-button']}
                    DefaultIcon={ACTION_ICONS.edit.default}
                    FilledIcon={ACTION_ICONS.edit.hover}
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
