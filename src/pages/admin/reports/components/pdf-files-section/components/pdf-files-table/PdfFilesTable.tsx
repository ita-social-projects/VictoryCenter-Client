import { ReactComponent as EyeIcon } from '@/assets/icons/eye-opened.svg';
import { ReactComponent as FileIcon } from '@/assets/icons/file.svg';
import { ReactComponent as NotFoundIcon } from '@/assets/icons/not-found.svg';
import { PDF_FILES_SECTION_TEXT } from '@/const/admin/reports';
import cn from 'classnames';
import styles from './PdfFilesTable.module.scss';
import { PdfReportDto } from '@/types/admin/pdf-section';

interface PdfFilesTableProps {
    files: PdfReportDto[];
    onViewFile: (file: PdfReportDto) => void;
}

export const PdfFilesTable: React.FC<PdfFilesTableProps> = ({ files }) => {
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
                                        <EyeIcon
                                            className={cn(styles['view-icon'], styles['icon-button'])}
                                            onClick={() => {}}
                                        />
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};
