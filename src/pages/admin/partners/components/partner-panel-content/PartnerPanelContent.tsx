import React, { useRef, useCallback } from 'react';
import { PartnerPageToolbar } from '../partner-page-toolbar/PartnerPageToolbar';
import { ToastContainer } from '@/components/admin/toast/toast-container/ToastContainer';
import { PartnerSectionsEditor, PartnerSectionsEditorRef } from '../partner-sections-editor/PartnerSectionsEditor';
import styles from './PartnerPanelContent.module.scss';
import { PartnerBanner } from '../partner-banner-form/PartnerBannerForm';

export const PartnerPanelContent = () => {
    const sectionsEditorRef = useRef<PartnerSectionsEditorRef>(null);

    const handleAddSection = useCallback(() => {
        sectionsEditorRef.current?.addSection();
    }, []);

    return (
        <div className={styles.root}>
            <div className={styles.toolbar}>
                <PartnerPageToolbar onAddSection={handleAddSection} />
            </div>

            <div className={styles['scrollable-area']}>
                <PartnerBanner />
                <PartnerSectionsEditor ref={sectionsEditorRef} />
            </div>

            <ToastContainer />
        </div>
    );
};
