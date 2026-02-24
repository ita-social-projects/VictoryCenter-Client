import { useCallback, useRef, useState } from 'react';
import { ToastContainer } from '@/components/admin/toast/toast-container/ToastContainer';
import styles from './ReportsPanelContent.module.scss';
import { ReportsPageToolbar, ReportsToolbarTab, TOOLBAR_TABS } from '../reports-page-toolbar/ReportsPageToolbar';
import { MediaSettings, MediaSettingsRef } from '../media-settings/MediaSettings';
import { ReportAnalytics } from '../report-analytics/ReportAnalytics';

export const ReportsPanelContent = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [resetCounter, setResetCounter] = useState(0);
    const mediaSettingsRef = useRef<MediaSettingsRef>(null);
    const [activeTab, setActiveTab] = useState<ReportsToolbarTab>(TOOLBAR_TABS[0]);

    const handleEdit = useCallback(() => {
        setIsEditing(true);
        setIsDirty(false);
    }, []);
    const handleCancel = useCallback(() => {
        setIsEditing(false);
        setIsDirty(false);
        setResetCounter((prev) => prev + 1);
    }, []);
    const handlePublish = useCallback(async () => {
        const result = await mediaSettingsRef.current?.submit();
        if (result) {
            setIsEditing(false);
            setIsDirty(false);
        }
    }, []);
    const handleDirtyChange = useCallback((dirty: boolean) => setIsDirty(dirty), []);

    return (
        <div className={styles.root}>
            <div className={styles.toolbar}>
                <ReportsPageToolbar
                    isEditing={isEditing}
                    isPublishDisabled={!isDirty}
                    onEdit={handleEdit}
                    onCancel={handleCancel}
                    onPublish={handlePublish}
                    selectedTab={activeTab}
                    onTabChange={setActiveTab}
                />
            </div>
            <div className={styles.content}>
                {activeTab.id === 'media-settings' && (
                    <MediaSettings
                        ref={mediaSettingsRef}
                        isEditing={isEditing}
                        resetCounter={resetCounter}
                        onDirtyChange={handleDirtyChange}
                    />
                )}
                {activeTab.id === 'report-analytics' && <ReportAnalytics isEditing={isEditing} />}
            </div>

            <ToastContainer />
        </div>
    );
};
