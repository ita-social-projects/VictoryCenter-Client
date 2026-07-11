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
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

export const ReportsPanelContent = () => {
    const [selectedTab, setSelectedTab] = useState<ReportsToolbarTab>(REPORTS_TOOLBAR_TABS[0]);
    const [isDirty, setIsDirty] = useState(false);
    const [resetCounter, setResetCounter] = useState(0);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const mediaSettingsRef = useRef<MediaSettingsRef>(null);

    const handleCancel = useCallback(() => {
        setIsDirty(false);
        setResetCounter((prev) => prev + 1);
    }, []);

    const handleTabSelect = useCallback((tab: ReportsToolbarTab) => {
        setSelectedTab(tab);
    }, []);

    const handlePublish = useCallback(() => {
        setIsConfirmOpen(true);
    }, []);

    const handleConfirmPublish = useCallback(async () => {
        setIsConfirmOpen(false);
        const result = await mediaSettingsRef.current?.submit();
        if (result) {
            setIsDirty(false);
        }
    }, []);

    const handleCloseConfirm = useCallback(() => {
        setIsConfirmOpen(false);
    }, []);

    const handleDirtyChange = useCallback((dirty: boolean) => setIsDirty(dirty), []);

    const isMediaSettingsTab = selectedTab.id === 'media-settings';

    return (
        <div className={styles.root}>
            <div className={styles.toolbar}>
                <ReportsPageToolbar selectedTab={selectedTab} onTabSelect={handleTabSelect} />
            </div>
            <div className={styles.content}>
                <MediaSettings
                    ref={mediaSettingsRef}
                    resetCounter={resetCounter}
                    onDirtyChange={handleDirtyChange}
                    onCancel={handleCancel}
                    onPublish={handlePublish}
                    isPublishDisabled={!isDirty}
                    isCancelDisabled={!isDirty}
                    isActive={isMediaSettingsTab}
                />
                {!isMediaSettingsTab && <ReportAnalytics />}
            </div>
            <ConfirmationModal
                isOpen={isConfirmOpen}
                onClose={handleCloseConfirm}
                title={COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES}
                onConfirm={handleConfirmPublish}
                onCancel={handleCloseConfirm}
            />
            <ToastContainer />
        </div>
    );
};
