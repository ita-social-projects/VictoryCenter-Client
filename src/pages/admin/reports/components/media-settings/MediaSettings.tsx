import {
    REPORTS_TEXT,
    REPORTS_MEDIA_SETTINGS_COLLECTED_FUNDS_VALIDATION,
    REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION,
} from '@/const/admin/reports';
import {
    ReportsMediaBlock,
    ReportsMediaBlockValues,
    ReportsMediaBlockErrors,
} from '../block-component/ReportsMediaBlock';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import styles from './MediaSettings.module.scss';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { ReportsApi } from '@/services/api/admin/reports/reports-api';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { ToastType } from '@/types/admin/toast';
import { ReportsMediaSettings } from '@/types/admin/reports';
import CollectedFundsImage from '@/assets/images/public/about-us-page/girl-horse.jpg';
import ChangedLivesImage from '@/assets/images/public/about-us-page/background.jpg';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

interface MediaSettingsProps {
    isEditing: boolean;
    resetCounter: number;
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

export const MediaSettings = forwardRef<MediaSettingsRef, MediaSettingsProps>(({ isEditing, resetCounter }, ref) => {
    const client = useAdminClient();
    const { addToast } = useToast();

    const [collectedFundsValues, setCollectedFundsValues] = useState<ReportsMediaBlockValues>(INITIAL_BLOCK_VALUES);
    const [collectedFundsErrors, setCollectedFundsErrors] = useState<ReportsMediaBlockErrors>(INITIAL_BLOCK_ERRORS);

    const [changedLivesValues, setChangedLivesValues] = useState<ReportsMediaBlockValues>(INITIAL_BLOCK_VALUES);
    const [changedLivesErrors, setChangedLivesErrors] = useState<ReportsMediaBlockErrors>(INITIAL_BLOCK_ERRORS);

    const fetchMediaSettings = useCallback(() => ReportsApi.getMediaSettings(client), [client]);

    const { data: mediaSettings, error } = useDataFetch<ReportsMediaSettings>({
        initialData: {
            collectedFunds: { title: '', collectedFunds: 0, image: null, imageId: null },
            changedLives: { title: '', changedLives: 0, image: null, imageId: null },
        },
        fetchHandler: fetchMediaSettings,
        autoFetchDependencies: [fetchMediaSettings],
    });

    useEffect(() => {
        if (error) {
            addToast(REPORTS_TEXT.MESSAGE.FAIL_TO_FETCH_REPORTS, ToastType.Error);
        }
    }, [error, addToast]);

    useEffect(() => {
        if (!mediaSettings) return;

        setCollectedFundsValues({
            title: mediaSettings.collectedFunds.title ?? '',
            totalAmount: mediaSettings.collectedFunds.collectedFunds ?? 0,
            image: mediaSettings.collectedFunds.image ?? null,
            imageId: mediaSettings.collectedFunds.imageId ?? null,
        });
        setCollectedFundsErrors(INITIAL_BLOCK_ERRORS);

        setChangedLivesValues({
            title: mediaSettings.changedLives.title ?? '',
            totalAmount: mediaSettings.changedLives.changedLives ?? 0,
            image: mediaSettings.changedLives.image ?? null,
            imageId: mediaSettings.changedLives.imageId ?? null,
        });
        setChangedLivesErrors(INITIAL_BLOCK_ERRORS);
    }, [mediaSettings, resetCounter]);

    const handleCollectedFundsChange = useCallback(
        (values: ReportsMediaBlockValues, errors: ReportsMediaBlockErrors) => {
            setCollectedFundsValues(values);
            setCollectedFundsErrors(errors);
        },
        [],
    );

    const handleChangedLivesChange = useCallback((values: ReportsMediaBlockValues, errors: ReportsMediaBlockErrors) => {
        setChangedLivesValues(values);
        setChangedLivesErrors(errors);
    }, []);

    const handlePublish = useCallback(async (): Promise<boolean> => {
        try {
            const updated = await ReportsApi.updateMediaSettings(client, {
                collectedFunds: {
                    title: collectedFundsValues.title,
                    collectedFunds: collectedFundsValues.totalAmount,
                    image: collectedFundsValues.image,
                    imageId: collectedFundsValues.imageId,
                },
                changedLives: {
                    title: changedLivesValues.title,
                    changedLives: changedLivesValues.totalAmount,
                    image: changedLivesValues.image,
                    imageId: changedLivesValues.imageId,
                },
            });

            setCollectedFundsValues({
                title: updated.collectedFunds.title ?? '',
                totalAmount: updated.collectedFunds.collectedFunds ?? 0,
                image: updated.collectedFunds.image ?? null,
                imageId: updated.collectedFunds.imageId ?? null,
            });
            setCollectedFundsErrors(INITIAL_BLOCK_ERRORS);

            setChangedLivesValues({
                title: updated.changedLives.title ?? '',
                totalAmount: updated.changedLives.changedLives ?? 0,
                image: updated.changedLives.image ?? null,
                imageId: updated.changedLives.imageId ?? null,
            });
            setChangedLivesErrors(INITIAL_BLOCK_ERRORS);

            addToast(COMMON_TEXT_ADMIN.MESSAGE.SUCCESSFULLY_PUBLISHED, ToastType.Info);
            return true;
        } catch {
            addToast(REPORTS_TEXT.MESSAGE.FAIL_TO_UPDATE_REPORT, ToastType.Error);
            return false;
        }
    }, [addToast, client, collectedFundsValues, changedLivesValues]);

    useImperativeHandle(ref, () => ({
        submit: handlePublish,
    }));

    return (
        <div className={styles.blocks}>
            <ReportsMediaBlock
                values={collectedFundsValues}
                errors={collectedFundsErrors}
                windowTitle={REPORTS_TEXT.FORM.LABEL.COLLECTED_FUNDS_WINDOW}
                windowDescription={REPORTS_TEXT.FORM.LABEL.WINDOW_DESCRIPTION}
                descriptionTitle={REPORTS_TEXT.FORM.LABEL.COLLECTED_FUNDS}
                totalAmountMaxLength={REPORTS_MEDIA_SETTINGS_COLLECTED_FUNDS_VALIDATION.collectedFunds.max}
                imageWidth={REPORTS_MEDIA_SETTINGS_COLLECTED_FUNDS_VALIDATION.image.width}
                imageHeight={REPORTS_MEDIA_SETTINGS_COLLECTED_FUNDS_VALIDATION.image.height}
                imageUrl={CollectedFundsImage}
                isEditing={isEditing}
                isValueEditable={false}
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
                isEditing={isEditing}
                isValueEditable={true}
                onValuesChange={handleChangedLivesChange}
            />
        </div>
    );
});

MediaSettings.displayName = 'MediaSettings';
