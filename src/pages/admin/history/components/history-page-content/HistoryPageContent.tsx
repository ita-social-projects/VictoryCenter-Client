import styles from './HistoryPageContent.module.scss';
import { Button } from '@/components/admin/button/Button';
import { InlineLoader } from '@/components/common/inline-loader/InlineLoader';
import NotFoundIcon from '@/assets/icons/not-found.svg';
import { HISTORY_TEXT } from '@/const/admin/history';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { ReactComponent as PlusIcon } from '@/assets/icons/plus.svg';
import { HistoryPageToolbar } from '../history-page-toolbar/HistoryPageToolbar';
import { useCallback } from 'react';
import { HistoryApi } from '@/services/api/admin/history/history-api';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { HistorySectionDto } from '@/types/common/history-sections';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { HistoryForm } from '../history-form/HistoryForm';

export const HistoryPageContent = () => {
    const client = useAdminClient();

    const getHistorySections = useCallback(async () => {
        const sections = await HistoryApi.fetchSections(client);
        return sections;
    }, [client]);

    const {
        data: sections,
        error: sectionsError,
        isLoading: isSectionsLoading,
        refetch: refetchSections,
    } = useDataFetch<HistorySectionDto[] | null>({
        initialData: null,
        fetchHandler: getHistorySections,
        autoFetchDependencies: [],
        autoFetchDisabled: false,
    });

    const normalizedSections = sections ?? [];
    const hasSections = normalizedSections.length > 0;
    const hasSectionsError = Boolean(sectionsError);

    const handleAddSection = () => {
        // TODO: add section creation flow will be implemented in a dedicated modal.
    };

    const handleRetrySections = useCallback(() => {
        void refetchSections();
    }, [refetchSections]);

    return (
        <div className={styles['history-page-wrapper']} data-testid="history-page-content">
            <HistoryPageToolbar onAddSection={handleAddSection} />
            <div className={styles['sections-container']}>
                {isSectionsLoading && (
                    <div className={styles['sections-loader-state']} data-testid="history-sections-loader">
                        <InlineLoader size={3} />
                    </div>
                )}

                {!isSectionsLoading && hasSectionsError && (
                    <div className={styles['sections-error-state']} data-testid="history-sections-error">
                        <p className={styles['sections-error-text']}>{HISTORY_TEXT.MESSAGE.FAIL_TO_FETCH_SECTIONS}</p>
                        <button
                            type="button"
                            className={styles['retry-link']}
                            onClick={handleRetrySections}
                            data-testid="history-sections-retry-button"
                        >
                            {COMMON_TEXT_ADMIN.BUTTON.TRY_AGAIN}
                        </button>
                    </div>
                )}

                {!isSectionsLoading && !hasSectionsError && !hasSections && (
                    <div className={styles['empty-sections-state']}>
                        <img src={NotFoundIcon} alt="No sections" className={styles['empty-sections-image']} />
                        <p className={styles['empty-sections-text']}>{HISTORY_TEXT.MESSAGE.NO_SECTIONS_YET}</p>
                        <Button
                            className={styles['btn-add']}
                            onClick={handleAddSection}
                            buttonStyle="secondary"
                            data-testid="add-section-button-empty"
                        >
                            {HISTORY_TEXT.BUTTON.ADD_SECTION}
                            <PlusIcon className={styles['plus-icon']} />
                        </Button>
                    </div>
                )}

                {!isSectionsLoading && !hasSectionsError && hasSections && (
                    <HistoryForm sections={normalizedSections} />
                )}
            </div>
        </div>
    );
};
