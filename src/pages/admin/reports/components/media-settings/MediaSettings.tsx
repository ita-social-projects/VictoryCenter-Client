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
import { ReportsPublicApi } from '@/services/api/public/reports/reports-api';
import { ReportsMediaSettings } from '@/types/admin/reports';
import { RequestOptions } from '@/types/common/api';
import { formatCollectedAmount } from '@/utils/functions/formatters/report-amount-formatters';
import { ToastType } from '@/types/admin/toast';
import { Button } from '@/components/admin/button/Button';
import axios from 'axios';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useMemo } from 'react';
import { ReportsMediaBlock } from '../block-component/ReportsMediaBlock';
import CollectedFundsImage from '@/assets/images/collected.webp';
import ChangedLivesImage from '@/assets/images/man-facing-horse-forehead.webp';
import styles from './MediaSettings.module.scss';
import {
    REPORTS_COLLECTED_FUNDS_VALIDATION_FUNCTIONS,
    REPORTS_CHANGED_LIVES_VALIDATION_FUNCTIONS,
} from '@/validation/admin/reports-schema/reports-media-settings/reports-media-settings-schema';
import { fetchDefaultImageAsImageValues } from '@/utils/functions/fetch-default-image/fetch-default-image';
import { Image, ImageValues } from '@/types/common/image';
import { useFormManager } from '@/hooks/admin/use-form-manager/useFormManager';
import { VisibilityStatus } from '@/types/admin/common';

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

export interface MediaBlockFormValues {
    title: string;
    titleEn: string;
    totalAmount: number | string;
    image: ImageValues | Image | null;
    imageId: number | null;
}

export interface MediaSettingsFormValues {
    collectedFunds: MediaBlockFormValues;
    changedLives: MediaBlockFormValues;
}

export interface MediaSettingsFormErrors {
    collectedFundsTitle?: string;
    collectedFundsTitleEn?: string;
    collectedFundsTotalAmount?: string;
    collectedFundsImage?: string;
    changedLivesTitle?: string;
    changedLivesTitleEn?: string;
    changedLivesTotalAmount?: string;
    changedLivesImage?: string;
    [key: string]: string | undefined;
}

const DEFAULT_FORM_STATE: MediaSettingsFormValues = {
    collectedFunds: {
        title: '',
        titleEn: '',
        totalAmount: 0,
        image: null,
        imageId: null,
    },
    changedLives: {
        title: '',
        titleEn: '',
        totalAmount: 0,
        image: null,
        imageId: null,
    },
};

const syncValuesFromData = (data: ReportsMediaSettings | null): MediaSettingsFormValues => {
    if (!data) return DEFAULT_FORM_STATE;
    return {
        collectedFunds: {
            totalAmount: 0,
            title: data.collectedFunds.title ?? '',
            titleEn: data.collectedFunds.titleEn ?? '',
            image: data.collectedFunds.image ?? null,
            imageId: data.collectedFunds.imageId ?? null,
        },
        changedLives: {
            title: data.changedLives.title ?? '',
            titleEn: data.changedLives.titleEn ?? '',
            totalAmount: data.changedLives.changedLives ?? 0,
            image: data.changedLives.image ?? null,
            imageId: data.changedLives.imageId ?? null,
        },
    };
};

const validateForm = (formState: MediaSettingsFormValues): MediaSettingsFormErrors => {
    return {
        collectedFundsTitle: REPORTS_COLLECTED_FUNDS_VALIDATION_FUNCTIONS.validateTitle(formState.collectedFunds.title),
        collectedFundsTitleEn: REPORTS_COLLECTED_FUNDS_VALIDATION_FUNCTIONS.validateTitleEn(
            formState.collectedFunds.titleEn,
        ),
        collectedFundsTotalAmount: undefined,
        collectedFundsImage: undefined,
        changedLivesTitle: REPORTS_CHANGED_LIVES_VALIDATION_FUNCTIONS.validateTitle(formState.changedLives.title),
        changedLivesTitleEn: REPORTS_CHANGED_LIVES_VALIDATION_FUNCTIONS.validateTitleEn(formState.changedLives.titleEn),
        changedLivesTotalAmount: REPORTS_CHANGED_LIVES_VALIDATION_FUNCTIONS.validateTotalAmount(
            formState.changedLives.totalAmount,
        ),
        changedLivesImage: undefined,
    };
};

export const MediaSettings = forwardRef<MediaSettingsRef, MediaSettingsProps>(
    ({ resetCounter, onDirtyChange, onCancel, onPublish, isPublishDisabled, isCancelDisabled, isActive }, ref) => {
        const client = useAdminClient();
        const { addToast } = useToast();

        const fetchMediaSettingsHandler = useCallback(() => ReportsApi.getMediaSettings(client), [client]);

        const {
            data: mediaSettingsData,
            isLoading,
            error: fetchError,
            refetch,
        } = useDataFetch<ReportsMediaSettings>({
            initialData: {
                collectedFunds: { title: '', titleEn: '', image: null, imageId: null },
                changedLives: { title: '', titleEn: '', changedLives: 0, image: null, imageId: null },
            },
            fetchHandler: fetchMediaSettingsHandler,
            autoFetchDisabled: false,
        });

        const fetchPublicCollectedTotalHandler = useCallback(async (options: RequestOptions = {}) => {
            try {
                const publishedReport = await ReportsPublicApi.getPublishedReports(undefined, options);
                return publishedReport.funding.totalUah;
            } catch (error) {
                if (axios.isAxiosError(error) && error.response?.status === 404) {
                    return 0;
                }
                throw error;
            }
        }, []);

        const { data: publicCollectedTotalUah } = useDataFetch<number>({
            initialData: 0,
            fetchHandler: fetchPublicCollectedTotalHandler,
            autoFetchDependencies: [isActive],
        });

        useEffect(() => {
            if (!fetchError) return;
            if (axios.isCancel?.(fetchError) || fetchError.name === 'CanceledError' || fetchError.name === 'AbortError')
                return;

            addToast(REPORTS_TEXT.MESSAGE.FAIL_TO_FETCH_REPORTS, ToastType.Error);
        }, [fetchError, addToast]);

        const initialData = useMemo(() => syncValuesFromData(mediaSettingsData), [mediaSettingsData]);

        const internalFormRef = useRef<any>(null);

        const resolveSubmitPromise = useRef<((value: boolean) => void) | null>(null);

        const onSubmit = useCallback(
            async (data: MediaSettingsFormValues) => {
                try {
                    let collectedFundsImage = data.collectedFunds.image;
                    let collectedFundsImageId = data.collectedFunds.imageId;

                    if (!collectedFundsImage && !collectedFundsImageId) {
                        collectedFundsImage = await fetchDefaultImageAsImageValues(
                            CollectedFundsImage,
                            REPORTS_MEDIA_SETTINGS_COLLECTED_FUNDS_VALIDATION.image.width,
                            REPORTS_MEDIA_SETTINGS_COLLECTED_FUNDS_VALIDATION.image.height,
                        );
                    }

                    let changedLivesImage = data.changedLives.image;
                    let changedLivesImageId = data.changedLives.imageId;

                    if (!changedLivesImage && !changedLivesImageId) {
                        changedLivesImage = await fetchDefaultImageAsImageValues(
                            ChangedLivesImage,
                            REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION.image.width,
                            REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION.image.height,
                        );
                    }

                    await ReportsApi.updateMediaSettings(client, {
                        collectedFunds: {
                            title: data.collectedFunds.title,
                            titleEn: data.collectedFunds.titleEn,
                            image: collectedFundsImage,
                            imageId: collectedFundsImageId,
                        },
                        changedLives: {
                            title: data.changedLives.title,
                            titleEn: data.changedLives.titleEn,
                            changedLives: (() => {
                                const parsed = parseInt(String(data.changedLives.totalAmount).trim(), 10);
                                if (isNaN(parsed)) throw new Error('changedLives is not a valid integer');
                                return parsed;
                            })(),
                            image: changedLivesImage,
                            imageId: changedLivesImageId,
                        },
                    });

                    addToast(COMMON_TEXT_ADMIN.MESSAGE.SUCCESSFULLY_PUBLISHED, ToastType.Success);

                    try {
                        await refetch(true);
                    } catch {
                        // Refetch error handled by useDataFetch
                    }

                    if (resolveSubmitPromise.current) {
                        resolveSubmitPromise.current(true);
                    }
                } catch (error: any) {
                    if (axios.isCancel?.(error) || error.name === 'CanceledError' || error.name === 'AbortError') {
                        if (resolveSubmitPromise.current) resolveSubmitPromise.current(false);
                        return;
                    }
                    addToast(REPORTS_TEXT.MESSAGE.FAIL_TO_UPDATE_REPORT, ToastType.Error);
                    if (resolveSubmitPromise.current) resolveSubmitPromise.current(false);
                }
            },
            [client, addToast, refetch],
        );

        const { formState, setFormState, errors, setErrors, reset, isDirty, isValid } = useFormManager<
            MediaSettingsFormValues,
            MediaSettingsFormErrors
        >({
            defaultFormState: DEFAULT_FORM_STATE,
            initialData,
            validateForm,
            onSubmit,
            ref: internalFormRef,
        });

        useEffect(() => {
            reset(initialData);
        }, [initialData, resetCounter, reset]);

        useEffect(() => {
            onDirtyChange(isDirty());
        }, [formState, isDirty, onDirtyChange]);

        const updateField = useCallback(
            <TBlock extends keyof MediaSettingsFormValues>(
                block: TBlock,
                field: keyof MediaBlockFormValues,
                value: any,
                blurValidationField?: keyof MediaSettingsFormErrors,
            ) => {
                setFormState((prev) => ({
                    ...prev,
                    [block]: {
                        ...prev[block],
                        [field]: value,
                    },
                }));
                if (blurValidationField) {
                    const newFormState = {
                        ...formState,
                        [block]: {
                            ...formState[block],
                            [field]: value,
                        },
                    };
                    const validationErrors = validateForm(newFormState);
                    setErrors((prev) => ({ ...prev, [blurValidationField]: validationErrors[blurValidationField] }));
                }
            },
            [formState, setFormState, setErrors],
        );

        const handlePublishProxy = useCallback(async (): Promise<boolean> => {
            return new Promise<boolean>((resolve) => {
                resolveSubmitPromise.current = resolve;
                if (!isValid(false)) {
                    internalFormRef.current?.submit(VisibilityStatus.Published).then(() => {
                        resolve(false);
                    });
                } else {
                    internalFormRef.current?.submit(VisibilityStatus.Published);
                }
            });
        }, [isValid]);

        useImperativeHandle(ref, () => ({ submit: handlePublishProxy }));

        const collectedFundsBlockValues = useMemo(
            () => ({
                ...formState.collectedFunds,
                totalAmount: formatCollectedAmount(publicCollectedTotalUah),
            }),
            [formState.collectedFunds, publicCollectedTotalUah],
        );

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
                        <Button onClick={() => refetch()} buttonStyle="primary" className={styles['error-button']}>
                            {REPORTS_TEXT.BUTTON.TRY_AGAIN}
                        </Button>
                    </div>
                )}
                {!isLoading && !fetchError && mediaSettingsData && (
                    <div>
                        <div className={styles.blocks}>
                            <ReportsMediaBlock
                                values={collectedFundsBlockValues}
                                titleError={errors.collectedFundsTitle}
                                titleEnError={errors.collectedFundsTitleEn}
                                totalAmountError={errors.collectedFundsTotalAmount}
                                imageError={errors.collectedFundsImage}
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
                                onTitleChange={(v) => updateField('collectedFunds', 'title', v)}
                                onTitleBlur={(v) => updateField('collectedFunds', 'title', v, 'collectedFundsTitle')}
                                onTitleEnChange={(v) => updateField('collectedFunds', 'titleEn', v)}
                                onTitleEnBlur={(v) =>
                                    updateField('collectedFunds', 'titleEn', v, 'collectedFundsTitleEn')
                                }
                                onTotalAmountChange={(v) => updateField('collectedFunds', 'totalAmount', v)}
                                onImageChange={(v) => {
                                    setFormState((prev) => ({
                                        ...prev,
                                        collectedFunds: { ...prev.collectedFunds, image: v, imageId: null },
                                    }));
                                    setErrors((prev) => ({ ...prev, collectedFundsImage: undefined }));
                                }}
                                onImageError={(err) =>
                                    setErrors((prev) => ({ ...prev, collectedFundsImage: err || undefined }))
                                }
                            />
                            <ReportsMediaBlock
                                values={formState.changedLives}
                                titleError={errors.changedLivesTitle}
                                titleEnError={errors.changedLivesTitleEn}
                                totalAmountError={errors.changedLivesTotalAmount}
                                imageError={errors.changedLivesImage}
                                windowTitle={REPORTS_TEXT.FORM.LABEL.CHANGED_LIVES_WINDOW}
                                windowDescription={REPORTS_TEXT.FORM.LABEL.WINDOW_DESCRIPTION}
                                descriptionTitle={REPORTS_TEXT.FORM.LABEL.CHANGED_LIVES}
                                totalAmountMaxLength={REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION.changedLives.max}
                                imageWidth={REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION.image.width}
                                imageHeight={REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION.image.height}
                                imageUrl={ChangedLivesImage}
                                isValueEditable={true}
                                onTitleChange={(v) => updateField('changedLives', 'title', v)}
                                onTitleBlur={(v) => updateField('changedLives', 'title', v, 'changedLivesTitle')}
                                onTitleEnChange={(v) => updateField('changedLives', 'titleEn', v)}
                                onTitleEnBlur={(v) => updateField('changedLives', 'titleEn', v, 'changedLivesTitleEn')}
                                onTotalAmountChange={(v) => {
                                    updateField('changedLives', 'totalAmount', v);
                                    const err = REPORTS_CHANGED_LIVES_VALIDATION_FUNCTIONS.validateTotalAmount(v);
                                    setErrors((prev) => ({ ...prev, changedLivesTotalAmount: err }));
                                }}
                                onImageChange={(v) => {
                                    setFormState((prev) => ({
                                        ...prev,
                                        changedLives: { ...prev.changedLives, image: v, imageId: null },
                                    }));
                                    setErrors((prev) => ({ ...prev, changedLivesImage: undefined }));
                                }}
                                onImageError={(err) =>
                                    setErrors((prev) => ({ ...prev, changedLivesImage: err || undefined }))
                                }
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
                                disabled={isPublishDisabled || Object.values(errors).some((err) => err !== undefined)}
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
