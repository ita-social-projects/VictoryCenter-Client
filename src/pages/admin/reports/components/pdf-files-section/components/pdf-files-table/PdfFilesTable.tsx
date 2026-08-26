import { IconButton } from '@/components/admin/icon-button/IconButton';
import { ACTION_ICONS } from '@/const/common/action-icons';
import { ReactComponent as FileIcon } from '@/assets/icons/file.svg';
import { ReactComponent as NotFoundIcon } from '@/assets/icons/not-found.svg';
import { ReactComponent as CheckmarkIcon } from '@/assets/icons/checkmark.svg';
import { ReactComponent as CrossIcon } from '@/assets/icons/cross.svg';
import { ReactComponent as DragIcon } from '@/assets/icons/dragger.svg';
import { ReactComponent as ArrowUpIcon } from '@/assets/icons/arrow-up.svg';
import { InlineLoader } from '@/components/common/inline-loader/InlineLoader';
import { PDF_FILES_SECTION_TEXT } from '@/const/admin/reports';
import cn from 'classnames';
import styles from './PdfFilesTable.module.scss';
import './PdfFilesTable.scss';
import { PdfReportDto } from '@/types/admin/pdf-section';
import { useState, useCallback, useMemo, useEffect } from 'react';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { PDF_FILE_RENAME_VALIDATION_FUNCTIONS } from '@/validation/admin/reports-schema/pdf-file-rename-schema/pdf-file-rename-schema';
import { useTableScrollToTop } from '@/hooks/admin/use-table-scroll-to-top/useTableScrollToTop';

interface PdfFilesTableProps {
    files: PdfReportDto[];
    onViewFile: (file: PdfReportDto) => void;
    onDeleteFile: (id: number) => Promise<void>;
    onRenameFile: (id: number, newName: string) => Promise<void>;
    onReorderFiles?: (reorderedFiles: PdfReportDto[]) => void;
    isDeleting?: boolean;
    isRenaming?: boolean;
    isReordering?: boolean;
    isLoadingMore?: boolean;
    onLoadMore?: () => void;
}

const normalizeFileName = (name: string): string => {
    return name.trim().replace(/\s+/g, ' ');
};

export const PdfFilesTable: React.FC<PdfFilesTableProps> = ({
    files,
    onDeleteFile,
    onViewFile,
    onRenameFile,
    onReorderFiles,
    isDeleting = false,
    isRenaming = false,
    isReordering = false,
    isLoadingMore = false,
    onLoadMore,
}) => {
    const [draggingId, setDraggingId] = useState<number | null>(null);
    const [dropTargetId, setDropTargetId] = useState<number | null>(null);

    useEffect(() => {
        if (draggingId && !files.some((f) => f.id === draggingId)) {
            setDraggingId(null);
        }
    }, [files, draggingId]);

    const handleDragStart = useCallback((e: React.DragEvent<HTMLTableRowElement>, id: number) => {
        setDraggingId(id);
        e.dataTransfer.setData('text/plain', id.toString());
        e.dataTransfer.effectAllowed = 'move';
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent<HTMLTableRowElement>, id: number) => {
        e.preventDefault();
        setDropTargetId(id);
        e.dataTransfer.dropEffect = 'move';
    }, []);

    const handleDragLeave = useCallback(() => {
        setDropTargetId(null);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent<HTMLTableRowElement>, targetId: number) => {
            e.preventDefault();
            setDropTargetId(null);
            const sourceIdStr = e.dataTransfer.getData('text/plain');
            if (!sourceIdStr) return;
            const sourceId = Number(sourceIdStr);
            if (sourceId === targetId) return;

            const updatedFiles = [...files];
            const fromIndex = updatedFiles.findIndex((f) => f.id === sourceId);
            const toIndex = updatedFiles.findIndex((f) => f.id === targetId);

            if (fromIndex !== -1 && toIndex !== -1) {
                const [draggedItem] = updatedFiles.splice(fromIndex, 1);
                updatedFiles.splice(toIndex, 0, draggedItem);
                onReorderFiles?.(updatedFiles);
            }
        },
        [files, onReorderFiles],
    );

    const handleDragEnd = useCallback(() => {
        setDraggingId(null);
        setDropTargetId(null);
    }, []);

    const { tableWrapperRef, isMoveToTopVisible, handleTableScroll, moveToTop } = useTableScrollToTop(files.length);

    const handleScroll = useCallback(
        (e: React.UIEvent<HTMLDivElement>) => {
            const target = e.currentTarget;
            const isNearBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50;
            if (isNearBottom && !isLoadingMore && onLoadMore) {
                onLoadMore();
            }
            handleTableScroll();
        },
        [onLoadMore, handleTableScroll, isLoadingMore],
    );

    const [deleteConfirmation, setDeleteConfirmation] = useState<{ isOpen: boolean; fileId: number | null }>({
        isOpen: false,
        fileId: null,
    });
    const [editingFileId, setEditingFileId] = useState<number | null>(null);
    const [editingFileName, setEditingFileName] = useState<string>('');
    const [editingError, setEditingError] = useState<string | undefined>(undefined);

    const handleCancelEdit = useCallback(() => {
        setEditingFileId(null);
        setEditingFileName('');
        setEditingError(undefined);
    }, []);

    const handleAcceptRename = useCallback(async () => {
        if (editingFileId === null) return;

        const normalizedName = normalizeFileName(editingFileName);

        const error = PDF_FILE_RENAME_VALIDATION_FUNCTIONS.validateName(normalizedName);
        if (error) {
            setEditingError(error);
            return;
        }

        try {
            await onRenameFile(editingFileId, normalizedName);
            handleCancelEdit();
        } catch {
            setEditingError('Помилка при збереженні');
        }
    }, [editingFileId, editingFileName, onRenameFile, handleCancelEdit]);

    const handleEditClick = useCallback((fileId: number, currentName: string) => {
        setEditingFileId(fileId);
        setEditingFileName(currentName);
        setEditingError(undefined);
    }, []);

    const handleEditInputChange = useCallback((value: string) => {
        setEditingFileName(value);

        const normalized = normalizeFileName(value);
        const error =
            normalized.length === 0 ? undefined : PDF_FILE_RENAME_VALIDATION_FUNCTIONS.validateName(normalized);
        setEditingError(error);
    }, []);

    const handleInputKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleAcceptRename();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                handleCancelEdit();
            }
        },
        [handleAcceptRename, handleCancelEdit],
    );

    const isAcceptDisabled = useMemo(() => {
        const normalizedName = normalizeFileName(editingFileName);
        if (normalizedName.length === 0) return true;
        const error = PDF_FILE_RENAME_VALIDATION_FUNCTIONS.validateName(normalizedName);
        return !!error;
    }, [editingFileName]);

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
        <div className={styles.container}>
            <div className={styles['table-container']}>
                <div
                    className={styles['table-wrapper']}
                    ref={tableWrapperRef}
                    onScroll={handleScroll}
                    data-testid="pdf-files-table-wrapper"
                >
                    <table className={styles.table}>
                        <thead>
                            <tr className={styles['header-row']}>
                                {files.length > 1 && <th className={cn(styles.cell, styles['drag-header-cell'])} />}
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
                                            <p className={styles['empty-text']}>
                                                {PDF_FILES_SECTION_TEXT.TABLE.NO_FILES}
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                files.map((file) => (
                                    <tr
                                        key={file.id}
                                        className={cn(styles.row, {
                                            [styles['row-dragging']]: draggingId === file.id,
                                            [styles['row-drop-target']]:
                                                dropTargetId === file.id && draggingId !== file.id,
                                        })}
                                        draggable={files.length > 1 && !isDeleting && !isRenaming && !isReordering}
                                        onDragStart={(e) => handleDragStart(e, file.id)}
                                        onDragOver={(e) => handleDragOver(e, file.id)}
                                        onDragLeave={handleDragLeave}
                                        onDrop={(e) => handleDrop(e, file.id)}
                                        onDragEnd={handleDragEnd}
                                    >
                                        {files.length > 1 && (
                                            <td className={cn(styles.cell, styles['drag-cell'])}>
                                                <div className={styles['drag-handle-wrapper']}>
                                                    <DragIcon className={styles['drag-handle-icon']} />
                                                </div>
                                            </td>
                                        )}
                                        <td className={cn(styles.cell, styles['name-cell'])}>
                                            {editingFileId === file.id ? (
                                                <div className={styles['rename-input-container']}>
                                                    <FileIcon className={styles['file-icon']} />
                                                    <input
                                                        type="text"
                                                        value={editingFileName}
                                                        onChange={(e) => handleEditInputChange(e.target.value)}
                                                        onKeyDown={handleInputKeyDown}
                                                        className={cn(styles['rename-input'], {
                                                            [styles['rename-input-error']]: !!editingError,
                                                        })}
                                                        autoFocus
                                                        pattern=".*"
                                                    />
                                                    <div className={styles['rename-actions']}>
                                                        <button
                                                            type="button"
                                                            onClick={handleAcceptRename}
                                                            disabled={isAcceptDisabled || isRenaming}
                                                            className={styles['rename-accept']}
                                                            aria-label={
                                                                PDF_FILES_SECTION_TEXT.ACTIONS.FILE.ACCEPT_RENAME
                                                            }
                                                        >
                                                            <CheckmarkIcon />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={handleCancelEdit}
                                                            disabled={isRenaming}
                                                            className={styles['rename-cancel']}
                                                            aria-label={
                                                                PDF_FILES_SECTION_TEXT.ACTIONS.FILE.CANCEL_RENAME
                                                            }
                                                        >
                                                            <CrossIcon />
                                                        </button>
                                                    </div>
                                                    {editingError && (
                                                        <div className={styles['rename-error']}>{editingError}</div>
                                                    )}
                                                </div>
                                            ) : (
                                                <>
                                                    <FileIcon className={styles['file-icon']} />
                                                    <span className={styles['file-name']}>{file.name}</span>
                                                </>
                                            )}
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
                                                    onClick={() => handleEditClick(file.id, file.name)}
                                                    className={styles['edit-button']}
                                                    DefaultIcon={ACTION_ICONS.edit.default}
                                                    FilledIcon={ACTION_ICONS.edit.hover}
                                                    disabled={editingFileId !== null || isRenaming}
                                                />
                                                <IconButton
                                                    aria-label={PDF_FILES_SECTION_TEXT.ACTIONS.FILE.VIEW}
                                                    type="button"
                                                    onClick={() => onViewFile(file)}
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
                                                    disabled={isDeleting || editingFileId !== null || isRenaming}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            {isLoadingMore && (
                <div className={styles['loading-more-container']}>
                    <InlineLoader size={2} />
                </div>
            )}
            <button
                type="button"
                className={cn(styles['to-top-button'], {
                    [styles['to-top-button-visible']]: isMoveToTopVisible,
                })}
                data-testid="pdf-files-table-to-top"
                onClick={moveToTop}
                aria-label={PDF_FILES_SECTION_TEXT.TABLE.SCROLL_TO_TOP}
                aria-hidden={!isMoveToTopVisible}
                tabIndex={isMoveToTopVisible ? 0 : -1}
            >
                <ArrowUpIcon className={styles['to-top-icon']} />
            </button>
            <ConfirmationModal
                isOpen={deleteConfirmation.isOpen}
                onClose={handleDeleteCancel}
                title={PDF_FILES_SECTION_TEXT.DELETE_CONFIRMATION.TITLE}
                onConfirm={handleDeleteConfirm}
                onCancel={handleDeleteCancel}
                isButtonsDisabled={isDeleting}
            />
        </div>
    );
};
