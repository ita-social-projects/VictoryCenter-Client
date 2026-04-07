import { IconButton } from '@/components/admin/icon-button/IconButton';
import { ACTION_ICONS } from '@/const/common/action-icons';
import { ReactComponent as FileIcon } from '@/assets/icons/file.svg';
import { ReactComponent as NotFoundIcon } from '@/assets/icons/not-found.svg';
import { PDF_FILES_SECTION_TEXT } from '@/const/admin/reports';
import cn from 'classnames';
import styles from './PdfFilesTable.module.scss';
import './PdfFilesTable.scss';
import { PdfReportDto } from '@/types/admin/pdf-section';
import { useState, useCallback } from 'react';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';

interface PdfFilesTableProps {
    files: PdfReportDto[];
    onViewFile: (file: PdfReportDto) => void;
    onDeleteFile: (id: number) => Promise<void>;
    isDeleting?: boolean;
}

export const PdfFilesTable: React.FC<PdfFilesTableProps> = ({ files, onDeleteFile, isDeleting = false }) => {
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; fileId: number | null }>({
        isOpen: false,
        fileId: null,
    });

    const handleDeleteClick = useCallback((fileId: number) => {
        setDeleteConfirmation({ isOpen: true, fileId });
    }, []);

    const handleDeleteConfirm = useCallback(async () => {
        if (deleteConfirmation.fileId !== null) {
            await onDeleteFile(deleteConfirmation.fileId);
        }
        setDeleteConfirmation({ isOpen: false, fileId: null });
    }, [deleteConfirmation.fileId, onDeleteFile]);

    const handleDeleteCancel = useCallback(() => {
        setDeleteConfirmation({ isOpen: false, fileId: null });
    }, []);
    return (
        <>
            <div className={styles['table-container']}>
                <table className={styles.table}>
                    <thead>
                        <tr className={styles['header-row']}>
                            <th className={cn(styles.cell, styles['name-cell'])}>
                                {PDF_FILES_SECTION_TEXT.TABLE.HEADER.NAME}
                            </th>
                            <th className={cn(styles.cell, styles['date-cell'])}>
                                {PDF_FILES_SECTION_TEXT.TABLE.HEADER.DATE_TIME}
                            </th>
                            <th className={cn(styles.cell, styles['size-cell'])}>
                                {PDF_FILES_SECTION_TEXT.TABLE.HEADER.SIZE}
                            </th>
                            <th className={cn(styles.cell, styles['actions-cell'])}>
                                {PDF_FILES_SECTION_TEXT.TABLE.HEADER.ACTIONS}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {files.length === 0 ? (
                            <tr className={styles['empty-row']}>
                                <td colSpan={4} className={styles['empty-cell']}>
                                    <div className={styles['empty-container']}>
                                        <NotFoundIcon className={styles['not-found-icon']} />
                                        <p className={styles['empty-text']}>{PDF_FILES_SECTION_TEXT.TABLE.NO_FILES}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            files.map((file) => (
                                <tr key={file.id} className={styles.row}>
                                    <td className={cn(styles.cell, styles['name-cell'])}>
                                        <FileIcon className={styles['file-icon']} />
                                        <span className={styles['file-name']}>{file.name}</span>
                                    </td>
                                    <td className={cn(styles.cell, styles['date-cell'])}>
                                        {new Date(file.createdAt).toLocaleDateString('uk-UA')}
                                    </td>
                                    <td className={cn(styles.cell, styles['size-cell'])}>
                                        {Math.round(file.fileSizeBytes / 1024)} KB
                                    </td>
                                    <td className={cn(styles.cell, styles['actions-cell'])}>
                                        <div className={styles['action-buttons']}>
                                            <IconButton
                                                aria-label={PDF_FILES_SECTION_TEXT.ACTIONS.FILE.EDIT}
                                                type="button"
                                                onClick={() => {}}
                                                className={styles['edit-button']}
                                                DefaultIcon={ACTION_ICONS.edit.default}
                                                FilledIcon={ACTION_ICONS.edit.hover}
                                            />
                                            <IconButton
                                                aria-label={PDF_FILES_SECTION_TEXT.ACTIONS.FILE.VIEW}
                                                type="button"
                                                onClick={() => {}}
                                                className={styles['view-button']}
                                                DefaultIcon={ACTION_ICONS.view.default}
                                            />
                                            <IconButton
                                                aria-label={PDF_FILES_SECTION_TEXT.ACTIONS.FILE.DELETE}
                                                type="button"
                                                onClick={() => handleDeleteClick(file.id)}
                                                className={styles['delete-button']}
                                                DefaultIcon={ACTION_ICONS.delete.default}
                                                FilledIcon={ACTION_ICONS.delete.hover}
                                                disabled={isDeleting}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            <ConfirmationModal
                isOpen={deleteConfirmation.isOpen}
                onClose={handleDeleteCancel}
                title={PDF_FILES_SECTION_TEXT.DELETE_CONFIRMATION.TITLE}
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
                isButtonsDisabled={isDeleting}
                className="delete-file-confirmation-modal"
            />
        </>
    );
};
