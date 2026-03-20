import { InlineLoader } from '@/components/common/inline-loader/InlineLoader';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import {
    REPORTS_TEXT,
    REPORTS_MEDIA_SETTINGS_COLLECTED_FUNDS_VALIDATION,
    REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION,
} from '@/const/admin/reports';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { ReportsApi } from '@/services/api/admin/reports/reports-api';
import { ReportsMediaSettings } from '@/types/admin/reports';
import { ToastType } from '@/types/admin/toast';
import { Button } from '@/components/admin/button/Button';
import axios from 'axios';
import { forwardRef, useState, useCallback, useEffect, useImperativeHandle } from 'react';
import {
    ReportsMediaBlockValues,
    ReportsMediaBlockErrors,
    ReportsMediaBlock,
} from '../block-component/ReportsMediaBlock';
import CollectedFundsImage from '@/assets/images/public/reports-page/collected.jpg';
import ChangedLivesImage from '@/assets/images/public/reports-page/lives-changed.jpg';
import styles from './MediaSettings.module.scss';
import {
    REPORTS_COLLECTED_FUNDS_VALIDATION_FUNCTIONS,
    REPORTS_CHANGED_LIVES_VALIDATION_FUNCTIONS,
} from '@/validation/admin/reports-schema/reports-media-settings/reports-media-settings-schema';
import { fetchDefaultImageAsImageValues } from '@/utils/functions/fetch-default-image/fetch-default-image';

interface MediaSettingsProps {
    resetCounter: number;
    onDirtyChange: (isDirty: boolean) => void;
    onCancel: () => void;
    onPublish: () => void;
    isPublishDisabled: boolean;
    isCancelDisabled: boolean;
    isActive: boolean;
}

export interface MediaSettingsRef {
    submit: () => Promise<boolean>;
}

const INITIAL_BLOCK_VALUES: ReportsMediaBlockValues = {
    title: '',
    totalAmount: 0,
    image: null,
    imageId: null,
};

const INITIAL_BLOCK_ERRORS: ReportsMediaBlockErrors = {};

const syncValuesFromData = (data: ReportsMediaSettings) => ({
    collectedFunds: {
        title: data.collectedFunds.title ?? '',
        totalAmount: data.collectedFunds.collectedFunds ?? 0,
        image: data.collectedFunds.image ?? null,
        imageId: data.collectedFunds.imageId ?? null,
    } satisfies ReportsMediaBlockValues,
    changedLives: {
        title: data.changedLives.title ?? '',
        totalAmount: data.changedLives.changedLives ?? 0,
        image: data.changedLives.image ?? null,
        imageId: data.changedLives.imageId ?? null,
    } satisfies ReportsMediaBlockValues,
});

export const MediaSettings = forwardRef<MediaSettingsRef, MediaSettingsProps>(
    ({ resetCounter, onDirtyChange, onCancel, onPublish, isPublishDisabled, isCancelDisabled, isActive }, ref) => {
        const client = useAdminClient();
        const { addToast } = useToast();

        const [collectedFundsValues, setCollectedFundsValues] = useState<ReportsMediaBlockValues>(INITIAL_BLOCK_VALUES);
        const [collectedFundsErrors, setCollectedFundsErrors] = useState<ReportsMediaBlockErrors>(INITIAL_BLOCK_ERRORS);

        const [changedLivesValues, setChangedLivesValues] = useState<ReportsMediaBlockValues>(INITIAL_BLOCK_VALUES);
        const [changedLivesErrors, setChangedLivesErrors] = useState<ReportsMediaBlockErrors>(INITIAL_BLOCK_ERRORS);

        const fetchMediaSettingsHandler = useCallback(() => ReportsApi.getMediaSettings(client), [client]);

        const {
            data: mediaSettingsData,
            isLoading,
            error: fetchError,
            refetch,
        } = useDataFetch<ReportsMediaSettings>({
            initialData: {
                collectedFunds: { title: '', collectedFunds: 0, image: null, imageId: null },
                changedLives: { title: '', changedLives: 0, image: null, imageId: null },
            },
            fetchHandler: fetchMediaSettingsHandler,
            autoFetchDisabled: false,
        });

        useEffect(() => {
            if (!fetchError) return;
            if (axios.isCancel?.(fetchError) || fetchError.name === 'CanceledError' || fetchError.name === 'AbortError')
                return;

            addToast(REPORTS_TEXT.MESSAGE.FAIL_TO_FETCH_REPORTS, ToastType.Error);
        }, [fetchError, addToast]);

        useEffect(() => {
            if (!mediaSettingsData) return;

            const { collectedFunds, changedLives } = syncValuesFromData(mediaSettingsData);
            setCollectedFundsValues(collectedFunds);
            setCollectedFundsErrors(INITIAL_BLOCK_ERRORS);
            setChangedLivesValues(changedLives);
            setChangedLivesErrors(INITIAL_BLOCK_ERRORS);
        }, [mediaSettingsData, resetCounter]);

        const handleCollectedFundsChange = useCallback(
            (values: ReportsMediaBlockValues, errors: ReportsMediaBlockErrors) => {
                setCollectedFundsValues(values);
                setCollectedFundsErrors(errors);
                onDirtyChange(true);
            },
            [onDirtyChange],
        );

        const handleChangedLivesChange = useCallback(
            (values: ReportsMediaBlockValues, errors: ReportsMediaBlockErrors) => {
                setChangedLivesValues(values);
                setChangedLivesErrors(errors);
                onDirtyChange(true);
            },
            [onDirtyChange],
        );

        const handlePublish = useCallback(async (): Promise<boolean> => {
            try {
                let collectedFundsImage = collectedFundsValues.image;
                let collectedFundsImageId = collectedFundsValues.imageId;

                if (!collectedFundsImage && !collectedFundsImageId) {
                    collectedFundsImage = await fetchDefaultImageAsImageValues(
                        CollectedFundsImage,
                        REPORTS_MEDIA_SETTINGS_COLLECTED_FUNDS_VALIDATION.image.width,
                        REPORTS_MEDIA_SETTINGS_COLLECTED_FUNDS_VALIDATION.image.height,
                    );
                }

                let changedLivesImage = changedLivesValues.image;
                let changedLivesImageId = changedLivesValues.imageId;

                if (!changedLivesImage && !changedLivesImageId) {
                    changedLivesImage = await fetchDefaultImageAsImageValues(
                        ChangedLivesImage,
                        REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION.image.width,
                        REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION.image.height,
                    );
                }

                const updated = await ReportsApi.updateMediaSettings(client, {
                    collectedFunds: {
                        title: collectedFundsValues.title,
                        collectedFunds: collectedFundsValues.totalAmount,
                        image: collectedFundsImage,
                        imageId: collectedFundsImageId,
                    },
                    changedLives: {
                        title: changedLivesValues.title,
                        changedLives: changedLivesValues.totalAmount,
                        image: changedLivesImage,
                        imageId: changedLivesImageId,
                    },
                });

                const { collectedFunds, changedLives } = syncValuesFromData(updated);
                setCollectedFundsValues(collectedFunds);
                setCollectedFundsErrors(INITIAL_BLOCK_ERRORS);
                setChangedLivesValues(changedLives);
                setChangedLivesErrors(INITIAL_BLOCK_ERRORS);

                await refetch();

                addToast(COMMON_TEXT_ADMIN.MESSAGE.SUCCESSFULLY_PUBLISHED, ToastType.Success);
                return true;
            } catch (error: any) {
                if (axios.isCancel?.(error) || error.name === 'CanceledError' || error.name === 'AbortError') {
                    return false;
                }
                addToast(REPORTS_TEXT.MESSAGE.FAIL_TO_UPDATE_REPORT, ToastType.Error);
                return false;
            }
        }, [addToast, client, collectedFundsValues, changedLivesValues, refetch]);

        useImperativeHandle(ref, () => ({ submit: handlePublish }));

        return (
            <div style={{ display: isActive ? 'block' : 'none' }}>
                {isLoading && (
                    <div className={styles.loader}>
                        <InlineLoader size={2} />
                    </div>
                )}
                {fetchError && !isLoading && (
                    <div className={styles.error}>
                        <p>{REPORTS_TEXT.MESSAGE.FAIL_TO_FETCH_REPORTS}</p>
                        <Button onClick={refetch} buttonStyle="primary" className={styles['error-button']}>
                            {REPORTS_TEXT.BUTTON.TRY_AGAIN}
                        </Button>
                    </div>
                )}
                {!isLoading && !fetchError && mediaSettingsData && (
                    <div>
                        <div className={styles.blocks}>
                            <ReportsMediaBlock
                                values={collectedFundsValues}
                                errors={collectedFundsErrors}
                                windowTitle={REPORTS_TEXT.FORM.LABEL.COLLECTED_FUNDS_WINDOW}
                                windowDescription={REPORTS_TEXT.FORM.LABEL.WINDOW_DESCRIPTION}
                                descriptionTitle={REPORTS_TEXT.FORM.LABEL.COLLECTED_FUNDS}
                                totalAmountMaxLength={
                                    REPORTS_MEDIA_SETTINGS_COLLECTED_FUNDS_VALIDATION.collectedAmount.max
                                }
                                imageWidth={REPORTS_MEDIA_SETTINGS_COLLECTED_FUNDS_VALIDATION.image.width}
                                imageHeight={REPORTS_MEDIA_SETTINGS_COLLECTED_FUNDS_VALIDATION.image.height}
                                imageUrl={CollectedFundsImage}
                                isValueEditable={false}
                                validationFunctions={REPORTS_COLLECTED_FUNDS_VALIDATION_FUNCTIONS}
                                onValuesChange={handleCollectedFundsChange}
                            />
                            <ReportsMediaBlock
                                values={changedLivesValues}
                                errors={changedLivesErrors}
                                windowTitle={REPORTS_TEXT.FORM.LABEL.CHANGED_LIVES_WINDOW}
                                windowDescription={REPORTS_TEXT.FORM.LABEL.WINDOW_DESCRIPTION}
                                descriptionTitle={REPORTS_TEXT.FORM.LABEL.CHANGED_LIVES}
                                totalAmountMaxLength={REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION.changedLives.max}
                                imageWidth={REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION.image.width}
                                imageHeight={REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION.image.height}
                                imageUrl={ChangedLivesImage}
                                isValueEditable={true}
                                validationFunctions={REPORTS_CHANGED_LIVES_VALIDATION_FUNCTIONS}
                                onValuesChange={handleChangedLivesChange}
                            />
                        </div>
                        <div className={styles.actions}>
                            <Button
                                buttonStyle="secondary"
                                className={styles.button}
                                onClick={onCancel}
                                disabled={isCancelDisabled}
                            >
                                {REPORTS_TEXT.BUTTON.CANCEL}
                            </Button>
                            <Button
                                buttonStyle="primary"
                                className={styles.button}
                                onClick={onPublish}
                                disabled={isPublishDisabled}
                            >
                                {REPORTS_TEXT.BUTTON.PUBLISH}
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        );
    },
);

MediaSettings.displayName = 'MediaSettings';
