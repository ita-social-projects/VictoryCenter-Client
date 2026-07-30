import React, { useRef, useCallback } from 'react';
import { PartnerPageToolbar } from '../partner-page-toolbar/PartnerPageToolbar';
import { ToastContainer } from '@/components/admin/toast/toast-container/ToastContainer';
import { PartnerSectionsEditor, PartnerSectionsEditorRef } from '../partner-sections-editor/PartnerSectionsEditor';
import { InlineLoader } from '@/components/common/inline-loader/InlineLoader';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { ToastType } from '@/types/admin/toast';
import { useLocalizationToolkit } from '@/hooks/admin/use-localization-toolkit/useLocalizationToolkit';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import styles from './PartnerPanelContent.module.scss';
import { PartnerBanner } from '../partner-banner-form/PartnerBannerForm';

export const PartnerPanelContent = () => {
    const sectionsEditorRef = useRef<PartnerSectionsEditorRef>(null);
    const { addToast } = useToast();

    const handleLocalizationError = useCallback(
        (message: string) => {
            addToast(message, ToastType.Error);
        },
        [addToast],
    );

    const { allLanguages, translationLanguages, selectedLanguage, onLanguageChange } = useLocalizationToolkit({
        setErrorState: handleLocalizationError,
    });

    const handleAddSection = useCallback(() => {
        sectionsEditorRef.current?.addSection();
    }, []);

    return (
        <div className={styles.root}>
            <div className={styles.toolbar}>
                <PartnerPageToolbar
                    onAddSection={handleAddSection}
                    disableAddSection={selectedLanguage?.code !== DEFAULT_LOCALE}
                    languages={allLanguages}
                    onLanguageChange={onLanguageChange}
                />
            </div>

            <div className={styles['scrollable-area']}>
                {selectedLanguage ? (
                    <>
                        <PartnerBanner language={selectedLanguage} translationLanguages={translationLanguages} />
                        <PartnerSectionsEditor
                            ref={sectionsEditorRef}
                            language={selectedLanguage}
                            translationLanguages={translationLanguages}
                        />
                    </>
                ) : (
                    <div className={styles.loader}>
                        <InlineLoader size={2} />
                    </div>
                )}
            </div>

            <ToastContainer />
        </div>
    );
};
