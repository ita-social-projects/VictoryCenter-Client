import { useCallback, useRef, useState } from 'react';
import { ToastContainer } from '@/components/admin/toast/toast-container/ToastContainer';
import styles from './ReportsPanelContent.module.scss';
import { ReportsPageToolbar } from '../reports-page-toolbar/ReportsPageToolbar';
import { MediaSettings, MediaSettingsRef } from '../media-settings/MediaSettings';

export const ReportsPanelContent = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [resetCounter, setResetCounter] = useState(0);
    const mediaSettingsRef = useRef<MediaSettingsRef>(null);

    const handleEdit = useCallback(() => setIsEditing(true), []);
    const handleCancel = useCallback(() => {
        setIsEditing(false);
        setResetCounter((prev) => prev + 1);
    }, []);
    const handlePublish = useCallback(async () => {
        const result = await mediaSettingsRef.current?.submit();
        if (result) {
            setIsEditing(false);
        }
    }, []);

    return (
        <div className={styles.root}>
            <div className={styles.toolbar}>
                <ReportsPageToolbar
                    isEditing={isEditing}
                    onEdit={handleEdit}
                    onCancel={handleCancel}
                    onPublish={handlePublish}
                />
            </div>
            <div className={styles.content}>
                <MediaSettings ref={mediaSettingsRef} isEditing={isEditing} resetCounter={resetCounter} />
            </div>

            <ToastContainer />
        </div>
    );
};
