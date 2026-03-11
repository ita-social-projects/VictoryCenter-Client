import { useCallback, useRef, useState } from 'react';
import { ToastContainer } from '@/components/admin/toast/toast-container/ToastContainer';
import styles from './ReportsPanelContent.module.scss';
import {
    ReportsPageToolbar,
    REPORTS_TOOLBAR_TABS,
    ReportsToolbarTab,
} from '../reports-page-toolbar/ReportsPageToolbar';
import { MediaSettings, MediaSettingsRef } from '../media-settings/MediaSettings';
import { ReportAnalytics } from '../report-analytics/ReportAnalytics';

export const ReportsPanelContent = () => {
    const [selectedTab, setSelectedTab] = useState<ReportsToolbarTab>(REPORTS_TOOLBAR_TABS[0]);
    const [isEditing, setIsEditing] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [resetCounter, setResetCounter] = useState(0);
    const mediaSettingsRef = useRef<MediaSettingsRef>(null);

    const handleCancel = useCallback(() => {
        setIsEditing(false);
        setIsDirty(false);
        setResetCounter((prev) => prev + 1);
    }, []);

    const handleTabSelect = useCallback(
        (tab: ReportsToolbarTab) => {
            if (tab.id === 'report-analytics' && isEditing) {
                handleCancel();
            }
            setSelectedTab(tab);
        },
        [isEditing, handleCancel],
    );

    const handleEdit = useCallback(() => {
        setIsEditing(true);
        setIsDirty(false);
    }, []);
    const handlePublish = useCallback(async () => {
        const result = await mediaSettingsRef.current?.submit();
        if (result) {
            setIsEditing(false);
            setIsDirty(false);
        }
    }, []);
    const handleDirtyChange = useCallback((dirty: boolean) => setIsDirty(dirty), []);

    const isMediaSettingsTab = selectedTab.id === 'media-settings';

    return (
        <div className={styles.root}>
            <div className={styles.toolbar}>
                <ReportsPageToolbar
                    selectedTab={selectedTab}
                    onTabSelect={handleTabSelect}
                    isEditing={isEditing}
                    isPublishDisabled={!isDirty}
                    onEdit={handleEdit}
                    onCancel={handleCancel}
                    onPublish={handlePublish}
                />
            </div>
            <div className={styles.content}>
                {isMediaSettingsTab ? (
                    <MediaSettings
                        ref={mediaSettingsRef}
                        isEditing={isEditing}
                        resetCounter={resetCounter}
                        onDirtyChange={handleDirtyChange}
                    />
                ) : (
                    <ReportAnalytics isEditing={isEditing} />
                )}
            </div>

            <ToastContainer />
        </div>
    );
};
