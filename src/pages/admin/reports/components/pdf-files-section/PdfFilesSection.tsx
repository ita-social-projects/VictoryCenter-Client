import { useState, useCallback } from 'react';
import { PdfSectionContentBlock } from './components/pdf-section-content-block/PdfSectionContentBlock';
import { PdfFilesTable } from './components/pdf-files-table/PdfFilesTable';
import styles from './PdfFilesSection.module.scss';

interface PdfSectionContent {
    title: string;
    description: string;
}

interface MockPdfFile {
    id: number;
    name: string;
    dateTime: string;
    size: string;
    url?: string;
}

const MOCK_CONTENT: PdfSectionContent = {
    title: 'Результати у звітах',
    description:
        'Для того, щоб побачити детальнішу інформацію, завантажте звіт конкретного року. Якщо цікавить щось інше, чи бажаєте дізнатись більше, зверніться до нас.',
};

const MOCK_PDF_FILES: MockPdfFile[] = [
    { id: 1, name: 'Звіт 2025', dateTime: '21.11.2025', size: '167KB' },
    { id: 2, name: 'Звіт 2024', dateTime: '21.11.2024', size: '256KB' },
    { id: 3, name: 'Звіт 2023', dateTime: '21.11.2023', size: '165KB' },
    { id: 4, name: 'Звіт 2022', dateTime: '21.11.2022', size: '167KB' },
];

interface PdfFilesSectionProps {
    isEditing: boolean;
}

export const PdfFilesSection = ({ isEditing }: PdfFilesSectionProps) => {
    const [content, setContent] = useState<PdfSectionContent>(MOCK_CONTENT);

    const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setContent((prev) => ({
            ...prev,
            title: e.target.value,
        }));
    }, []);

    const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setContent((prev) => ({
            ...prev,
            description: e.target.value,
        }));
    }, []);

    const handleViewFile = useCallback((file: MockPdfFile) => {
        // TODO: Implement file preview or download
        console.log('View file:', file);
    }, []);

    const handleDeleteFile = useCallback((fileId: number) => {
        // TODO: Implement file deletion
        console.log('Delete file:', fileId);
    }, []);

    const handleDownloadFile = useCallback((file: MockPdfFile) => {
        // TODO: Implement file download
        console.log('Download file:', file);
    }, []);

    return (
        <div className={styles.root}>
            <PdfSectionContentBlock
                content={content}
                isEditing={isEditing}
                onTitleChange={handleTitleChange}
                onDescriptionChange={handleDescriptionChange}
            />
            <PdfFilesTable
                files={MOCK_PDF_FILES}
                isEditing={isEditing}
                onViewFile={handleViewFile}
                onDownloadFile={handleDownloadFile}
                onDeleteFile={handleDeleteFile}
            />
        </div>
    );
};
