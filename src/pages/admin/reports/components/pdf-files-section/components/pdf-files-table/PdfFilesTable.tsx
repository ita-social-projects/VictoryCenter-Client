import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { ReactComponent as EyeIcon } from '@/assets/icons/eye-opened.svg';
import { ReactComponent as DeleteIcon } from '@/assets/icons/delete.svg';
import { ReactComponent as DownloadIcon } from '@/assets/icons/cloud-download.svg';
import { PDF_FILES_SECTION_TEXT } from '@/const/admin/reports';
import cn from 'classnames';
import styles from './PdfFilesTable.module.scss';

interface PdfFile {
    id: number;
    name: string;
    dateTime: string;
    size: string;
    url?: string;
}

interface PdfFilesTableProps {
    files: PdfFile[];
    isEditing: boolean;
    onViewFile: (file: PdfFile) => void;
    onDownloadFile: (file: PdfFile) => void;
    onDeleteFile: (fileId: number) => void;
}

export const PdfFilesTable: React.FC<PdfFilesTableProps> = ({
    files,
    isEditing,
    onViewFile,
    onDownloadFile,
    onDeleteFile,
}) => {
    return (
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
                    {files.map((file) => (
                        <tr key={file.id} className={styles.row}>
                            <td className={cn(styles.cell, styles['name-cell'])}>
                                <span className={styles['file-name']}>{file.name}</span>
                            </td>
                            <td className={cn(styles.cell, styles['date-cell'])}>{file.dateTime}</td>
                            <td className={cn(styles.cell, styles['size-cell'])}>{file.size}</td>
                            <td className={cn(styles.cell, styles['actions-cell'])}>
                                <div className={styles['action-buttons']}>
                                    <Tooltip title={PDF_FILES_SECTION_TEXT.TABLE.ACTION.VIEW} placement="top">
                                        <IconButton
                                            size="small"
                                            onClick={() => onViewFile(file)}
                                            className={styles['action-button']}
                                        >
                                            <EyeIcon width={20} height={20} />
                                        </IconButton>
                                    </Tooltip>
                                    {isEditing && (
                                        <>
                                            <Tooltip
                                                title={PDF_FILES_SECTION_TEXT.TABLE.ACTION.DOWNLOAD}
                                                placement="top"
                                            >
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onDownloadFile(file)}
                                                    className={styles['action-button']}
                                                >
                                                    <DownloadIcon width={20} height={20} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={PDF_FILES_SECTION_TEXT.TABLE.ACTION.DELETE} placement="top">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => onDeleteFile(file.id)}
                                                    className={cn(styles['action-button'], styles['delete-button'])}
                                                >
                                                    <DeleteIcon width={20} height={20} />
                                                </IconButton>
                                            </Tooltip>
                                        </>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
