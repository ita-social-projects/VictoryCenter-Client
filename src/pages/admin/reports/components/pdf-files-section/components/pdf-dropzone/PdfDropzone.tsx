import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { PdfReportsApi } from '@/services/api/admin/reports/pdf-reports/pdf-reports-api';
import { PdfReportDto } from '@/types/admin/pdf-section';
import { useState, useCallback } from 'react';
import styles from './PdfDropzone.module.scss';
import { ReactComponent as FileIcon } from '@/assets/icons/sticky_note.svg';
import { ReactComponent as AddIcon } from '@/assets/icons/add.svg';
import { PDF_FILES_SECTION_TEXT, PDF_FILES_SECTION_VALIDATION } from '@/const/admin/reports';

interface PdfDropzoneProps {
    onUploaded: (file: PdfReportDto) => void;
    languageId: number;
}

const extractErrorMessage = (error: unknown): string => {
    const errorData = (error as any)?.response?.data;

    if (errorData) {
        if (Array.isArray(errorData.errors) && errorData.errors.length > 0) {
            return errorData.errors[0];
        }

        if (typeof errorData.errors === 'string') {
            return errorData.errors;
        }
    }

    return PDF_FILES_SECTION_TEXT.DROPZONE.ERROR_UPLOAD_FAILED;
};

export const PdfDropzone = ({ onUploaded, languageId }: PdfDropzoneProps) => {
    const client = useAdminClient();
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFile = useCallback(
        async (file: File) => {
            if (file.type !== 'application/pdf') {
                setError(PDF_FILES_SECTION_TEXT.DROPZONE.ERROR_INVALID_FORMAT);
                setTimeout(() => setError(null), 5000);
                return;
            }

            if (file.size > PDF_FILES_SECTION_VALIDATION.max_file_size_bytes) {
                setError(PDF_FILES_SECTION_TEXT.DROPZONE.ERROR_FILE_TOO_LARGE);
                setTimeout(() => setError(null), 5000);
                return;
            }

            setError(null);
            setIsUploading(true);
            try {
                const result = await PdfReportsApi.create(client, file, languageId);
                onUploaded(result);
            } catch (err) {
                const errorMessage = extractErrorMessage(err);
                setError(errorMessage);
                setTimeout(() => setError(null), 5000);
            } finally {
                setIsUploading(false);
            }
        },
        [client, onUploaded],
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
        },
        [handleFile],
    );

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
        },
        [handleFile],
    );

    return (
        <div className={styles.root}>
            <label
                className={`${styles.dropzone} ${isDragging ? styles.dragging : ''} ${isUploading ? styles.uploading : ''}`}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    accept="application/pdf"
                    className={styles.input}
                    onChange={handleInputChange}
                    disabled={isUploading}
                />
                <div className={styles.content}>
                    <div className={styles.icons}>
                        <FileIcon className={styles['file-icon']} fill="#FFFFFF" />
                        <AddIcon className={styles['plus-icon']} />
                    </div>
                    <p className={styles.title}>
                        {isUploading
                            ? PDF_FILES_SECTION_TEXT.DROPZONE.UPLOADING
                            : PDF_FILES_SECTION_TEXT.DROPZONE.TITLE}
                    </p>
                    <p className={styles.subtitle}>{PDF_FILES_SECTION_TEXT.DROPZONE.SUBTITLE}</p>
                </div>
            </label>
            <div className={styles['error-container']}>{error && <p className={styles.error}>{error}</p>}</div>
        </div>
    );
};
