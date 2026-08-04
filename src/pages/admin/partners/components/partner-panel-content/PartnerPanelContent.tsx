import React, { useRef, useCallback, useState } from 'react';
import { PartnerPageToolbar } from '../partner-page-toolbar/PartnerPageToolbar';
import { ToastContainer } from '@/components/admin/toast/toast-container/ToastContainer';
import { PartnerSectionsEditor, PartnerSectionsEditorRef } from '../partner-sections-editor/PartnerSectionsEditor';
import { InlineLoader } from '@/components/common/inline-loader/InlineLoader';
import { Button } from '@/components/admin/button/Button';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { useLocalizationToolkit } from '@/hooks/admin/use-localization-toolkit/useLocalizationToolkit';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import styles from './PartnerPanelContent.module.scss';
import { PartnerBanner } from '../partner-banner-form/PartnerBannerForm';

export const PartnerPanelContent = () => {
    const sectionsEditorRef = useRef<PartnerSectionsEditorRef>(null);
    const [languagesError, setLanguagesError] = useState<string | null>(null);

    const { allLanguages, translationLanguages, selectedLanguage, onLanguageChange, retryFetchLanguages } =
        useLocalizationToolkit({
            setErrorState: setLanguagesError,
        });

    const handleRetryFetchLanguages = useCallback(() => {
        setLanguagesError(null);
        retryFetchLanguages();
    }, [retryFetchLanguages]);

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
                {languagesError ? (
                    <div className={styles.error}>
                        <p>{languagesError}</p>
                        <Button onClick={handleRetryFetchLanguages} buttonStyle="primary">
                            {COMMON_TEXT_ADMIN.BUTTON.TRY_AGAIN}
                        </Button>
                    </div>
                ) : selectedLanguage ? (
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
