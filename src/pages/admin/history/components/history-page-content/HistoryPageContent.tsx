import styles from './HistoryPageContent.module.scss';
import { Button } from '@/components/admin/button/Button';
import { InlineLoader } from '@/components/common/inline-loader/InlineLoader';
import NotFoundIcon from '@/assets/icons/not-found.svg';
import { HISTORY_TEXT } from '@/const/admin/history';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { ReactComponent as PlusIcon } from '@/assets/icons/plus.svg';
import { HistoryPageToolbar } from '../history-page-toolbar/HistoryPageToolbar';
import { Fragment, useCallback } from 'react';
import { HistoryApi } from '@/services/api/admin/history/history-api';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { HistorySectionDto } from '@/types/common/history-sections';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { renderHistorySection } from '@/utils/functions/render-history-section';
import { ContentType } from '@/types/common/section-contents';
import { SECTIONS_TEXT } from '@/const/admin/sections';
import { IconButton } from '@/components/admin/icon-button/IconButton';
import { ACTION_ICONS } from '@/const/common/action-icons';
import { ReactComponent as ChangeIcon } from '@/assets/icons/change.svg';
import { SectionMode } from '@/types/common/sections';

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
                    <div className={styles['sections-list']}>
                        {normalizedSections.map((section, index) => {
                            if (!section) return null;
                            const titleContent = section.contents.find((c) => c.contentType === ContentType.Title);
                            const descriptionContent = section.contents.find(
                                (c) => c.contentType === ContentType.Description,
                            );
                            const imageContents = section.contents
                                .filter((c) => c.contentType === ContentType.Image)
                                .map((c) => c.image ?? null);

                            const sectionToRender = renderHistorySection({
                                templateId: section.template,
                                data: {
                                    title: titleContent?.title ?? '',
                                    description: descriptionContent?.description ?? '',
                                    images: imageContents,
                                },
                            });

                            const isFirstSection = index === 0;
                            const isLastSection = index === normalizedSections.length - 1;
                            const sectionMode = SectionMode.View; //TODO: replace to dynamic value

                            return (
                                <Fragment key={section.id ?? index}>
                                    <div className={styles['section-container']}>
                                        {sectionMode === SectionMode.View && (
                                            <div className={styles['actions-section']}>
                                                <div className={styles['order-controls']}>
                                                    <div className={styles['order-controls']}>
                                                        {!isFirstSection && (
                                                            <button
                                                                type="button"
                                                                className={`${styles['icon-button']} ${styles['up-button']}`}
                                                                aria-label="Move up section"
                                                            />
                                                        )}
                                                        {!isLastSection && (
                                                            <button
                                                                type="button"
                                                                className={`${styles['icon-button']} ${styles['down-button']}`}
                                                                aria-label="Move down section"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className={styles['hover-buttons']}>
                                                    <IconButton
                                                        type="button"
                                                        className={`${styles['icon-button']} ${styles['edit-button']}`}
                                                        aria-label="Edit section"
                                                        DefaultIcon={ACTION_ICONS.edit.default}
                                                        FilledIcon={ACTION_ICONS.edit.hover}
                                                    />
                                                    <IconButton
                                                        type="button"
                                                        className={`${styles['icon-button']} ${styles['delete-button']}`}
                                                        aria-label="Delete section"
                                                        DefaultIcon={ACTION_ICONS.delete.default}
                                                        FilledIcon={ACTION_ICONS.delete.hover}
                                                    />
                                                    <button
                                                        type="button"
                                                        className={`${styles['icon-button']} ${styles['change-button']}`}
                                                        aria-label="Replace section"
                                                    >
                                                        <ChangeIcon />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                        <div className={styles.content}>{sectionToRender}</div>
                                        <div className={styles['actions-container']}>
                                            {sectionMode !== SectionMode.View && (
                                                <div className={styles.actions}>
                                                    <Button buttonStyle="secondary">
                                                        {SECTIONS_TEXT.BUTTON.CANCEL}
                                                    </Button>
                                                    <Button buttonStyle="primary">{SECTIONS_TEXT.BUTTON.SAVE}</Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className={styles['sections-divider']} />
                                </Fragment>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
