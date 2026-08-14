import React, { useCallback, useState, useEffect } from 'react';
import { ImageValues, Image } from '@/types/common/image';
import styles from './PartnerBannerForm.module.scss';
import { PARTNER_BANNER_VALIDATION, PARTNERS_TEXT } from '@/const/admin/partners';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { PartnersApi } from '@/services/api/admin/partners/partners-api';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { ToastType } from '@/types/admin/toast';
import { InlineLoader } from '@/components/common/inline-loader/InlineLoader';
import { Button } from '@/components/admin/button/Button';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import axios from 'axios';
import { PartnerBanner as PartnerBannerType, PartnerBannerLocalization } from '@/types/admin/partners';
import { PARTNER_BANNER_VALIDATION_FUNCTIONS } from '@/validation/admin/partner-schema/partner-schema';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { ImageInput } from '@/components/admin/image-input/ImageInput';
import { InputError } from '@/components/admin/input-error/InputError';
import BannerImage from '@/assets/images/horses.webp';
import { RichTextInputGroup } from '@/components/admin/input-groups/rich-text-input-group/RichTextInputGroup';
import { getPlainTextFromHtml } from '@/utils/functions/get-plain-text-from-html/get-plain-text-from-html';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { IconButton } from '@/components/admin/icon-button/IconButton';
import { LocalizationStatuses } from '@/components/admin/localization-statuses/LocalizationStatuses';
import { ACTION_ICONS } from '@/const/common/action-icons';
import { LocalizationLanguage } from '@/types/common/language';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { returnDisplayedLocalization } from '@/utils/functions/localization/localization';
import { TranslatePartnerBannerModal } from '../translate-partner-banner-modal/TranslatePartnerBannerModal';

export interface PartnerBannerValues {
    id: number;
    title: string;
    description: string;
    image: ImageValues | Image | null;
    imageId: number | null;
    localizations: PartnerBannerLocalization[];
}

export interface PartnerBannerErrorState {
    title?: string;
    description?: string;
    image?: string;
    [key: string]: string | undefined;
}

const isFormValid = (values: PartnerBannerValues, errors: PartnerBannerErrorState) => {
    if (!values) return false;

    if (Object.values(errors).some((err) => !!err)) {
        return false;
    }

    const plainTitle = getPlainTextFromHtml(values.title);

    const titleError = PARTNER_BANNER_VALIDATION_FUNCTIONS.validateTitle(plainTitle);
    const descError = PARTNER_BANNER_VALIDATION_FUNCTIONS.validateDescription(values.description);

    return !titleError && !descError && !errors.image;
};

interface FormState {
    values: PartnerBannerValues | null;
    savedValues: PartnerBannerValues | null;
}

const isImageEqual = (img1: ImageValues | Image | null, img2: ImageValues | Image | null) => {
    if (img1 === img2) return true;
    if (!img1 || !img2) return false;
    if ('url' in img1 && 'url' in img2) return img1.url === img2.url;
    if ('base64' in img1 && 'base64' in img2) return img1.base64 === img2.base64;
    return false;
};

export interface PartnerBannerProps {
    language: LocalizationLanguage;
    translationLanguages: LocalizationLanguage[];
}

export const PartnerBanner = ({ language, translationLanguages }: PartnerBannerProps) => {
    const client = useAdminClient();
    const { addToast } = useToast();
    const [formState, setFormState] = useState<FormState>({
        values: null,
        savedValues: null,
    });
    const [errors, setErrors] = useState<PartnerBannerErrorState>({});
    const [touched, setTouched] = useState<{ title?: boolean; description?: boolean }>({});
    const [isPublishing, setIsPublishing] = useState(false);
    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [titleKey, setTitleKey] = useState(0);
    const [isTranslateModalOpen, setIsTranslateModalOpen] = useState(false);

    const isBaseLanguage = language.code === DEFAULT_LOCALE;

    const fetchBannerHandler = useCallback(() => {
        return PartnersApi.getBanner(client);
    }, [client]);

    const {
        data: bannerData,
        isLoading: isLoadingData,
        error: fetchError,
        refetch: refetchBanner,
    } = useDataFetch<PartnerBannerType>({
        initialData: { id: 0, title: '', description: '', image: null, imageId: null, localizations: [] },
        fetchHandler: fetchBannerHandler,
        autoFetchDisabled: false,
    });

    const { values, savedValues } = formState;

    const isDirty = React.useMemo(() => {
        if (!savedValues || !values) return false;
        return (
            savedValues.title !== values.title ||
            savedValues.description !== values.description ||
            savedValues.imageId !== values.imageId ||
            !isImageEqual(savedValues.image, values.image)
        );
    }, [savedValues, values]);

    useEffect(() => {
        if (!isLoadingData && bannerData && bannerData.title) {
            setFormState({ values: bannerData, savedValues: bannerData });
            setTouched({});
            setErrors({});
            setTitleKey((prev) => prev + 1);
        }
    }, [bannerData, isLoadingData]);

    useEffect(() => {
        if (fetchError) {
            if (
                axios.isCancel?.(fetchError) ||
                fetchError.name === 'CanceledError' ||
                fetchError.name === 'AbortError'
            ) {
                return;
            }
            addToast(PARTNERS_TEXT.MESSAGE.FAIL_TO_LOAD_BANNER, ToastType.Error);
        }
    }, [fetchError, addToast]);

    const handleTitleChange = useCallback(
        (newValue: string) => {
            if (!isBaseLanguage) return;

            setFormState((prev) => ({
                ...prev,
                values: prev.values ? { ...prev.values, title: newValue } : null,
            }));

            const plainText = getPlainTextFromHtml(newValue);

            setErrors((prev) => ({
                ...prev,
                title: PARTNER_BANNER_VALIDATION_FUNCTIONS.validateTitle(plainText),
            }));
        },
        [isBaseLanguage],
    );

    const handleTitleBlur = useCallback(() => {
        setTouched((prev) => ({ ...prev, title: true }));
    }, []);

    const handleDescriptionChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (!isBaseLanguage) return;

            const newValue = e.target.value;
            setFormState((prev) => ({
                ...prev,
                values: prev.values ? { ...prev.values, description: newValue } : null,
            }));
            setTouched((prev) => ({ ...prev, description: true }));
            setErrors((prev) => ({
                ...prev,
                description: PARTNER_BANNER_VALIDATION_FUNCTIONS.validateDescription(newValue),
            }));
        },
        [isBaseLanguage],
    );

    const handleImageChange = useCallback(
        (value: ImageValues | null) => {
            if (!isBaseLanguage) return;

            setFormState((prev) => ({
                ...prev,
                values: prev.values
                    ? { ...prev.values, image: value, imageId: value ? prev.values.imageId : null }
                    : null,
            }));
        },
        [isBaseLanguage],
    );

    const handleImageError = useCallback(
        (error: string | null) => {
            if (!isBaseLanguage) return;

            setErrors((prev) => ({
                ...prev,
                image: error ? error : undefined,
            }));
        },
        [isBaseLanguage],
    );

    const handlePublishClick = useCallback(() => {
        setIsPublishModalOpen(true);
    }, []);

    const handlePublishConfirm = useCallback(async () => {
        if (!values || !isFormValid(values, errors)) return;

        setIsPublishModalOpen(false);
        setIsPublishing(true);
        try {
            const updatedBanner = await PartnersApi.updateBanner(client, {
                title: values.title,
                description: values.description,
                image: values.image,
                imageId: values.imageId,
            });

            const nextBanner: PartnerBannerType = {
                ...updatedBanner,
                localizations: updatedBanner.localizations.length ? updatedBanner.localizations : values.localizations,
            };

            setFormState({ values: nextBanner, savedValues: nextBanner });
            setTouched({});
            setErrors({});
            addToast(PARTNERS_TEXT.MESSAGE.BANNER_PUBLISHED, ToastType.Success, 3000);
        } catch (error: any) {
            if (axios.isCancel?.(error) || error.name === 'CanceledError' || error.name === 'AbortError') {
                return;
            }
            addToast(PARTNERS_TEXT.MESSAGE.FAIL_TO_UPDATE_BANNER, ToastType.Error);
        } finally {
            setIsPublishing(false);
        }
    }, [values, errors, client, addToast]);

    const handleOpenTranslateModal = useCallback(() => {
        setIsTranslateModalOpen(true);
    }, []);

    const handleCloseTranslateModal = useCallback(() => {
        setIsTranslateModalOpen(false);
    }, []);

    const handleTranslateBannerSuccess = useCallback(
        (updatedBanner: PartnerBannerType) => {
            setFormState((prev) => ({
                values: prev.values ? { ...prev.values, localizations: updatedBanner.localizations } : prev.values,
                savedValues: prev.savedValues
                    ? { ...prev.savedValues, localizations: updatedBanner.localizations }
                    : prev.savedValues,
            }));
            addToast(COMMON_TEXT_ADMIN.MESSAGE.TRANSLATION_SAVED_SUCCESS, ToastType.Success);
        },
        [addToast],
    );

    if (isLoadingData) {
        return (
            <div className={styles.loader}>
                <InlineLoader size={2} />
            </div>
        );
    }

    if (fetchError || !values) {
        return (
            <div className={styles.error}>
                <p>{PARTNERS_TEXT.MESSAGE.FAIL_TO_LOAD_BANNER}</p>
                <Button onClick={() => refetchBanner()} buttonStyle="primary">
                    {PARTNERS_TEXT.BUTTON.TRY_AGAIN}
                </Button>
            </div>
        );
    }

    const isDisabled = isPublishing;
    const displayedLocalization = isBaseLanguage ? null : returnDisplayedLocalization(values, language.code);
    const displayedTitle = isBaseLanguage ? values.title : (displayedLocalization?.title ?? '');
    const displayedDescription = isBaseLanguage ? values.description : (displayedLocalization?.description ?? '');

    return (
        <div className={styles.root}>
            {isLoadingData && (
                <div className={styles.loader}>
                    <InlineLoader size={2} />
                </div>
            )}

            {fetchError && !isLoadingData && (
                <div className={styles.error}>
                    <p>{PARTNERS_TEXT.MESSAGE.FAIL_TO_LOAD_BANNER}</p>
                    <Button onClick={() => refetchBanner()} buttonStyle="primary">
                        {PARTNERS_TEXT.BUTTON.TRY_AGAIN}
                    </Button>
                </div>
            )}

            {!isLoadingData && !fetchError && values && (
                <>
                    <div className={styles['status-bar']}>
                        <LocalizationStatuses languages={translationLanguages} localizedEntity={values} />
                        <IconButton
                            aria-label={COMMON_TEXT_ADMIN.LOCALIZATION.FORM.TITLE.ADD_TRANSLATION}
                            type="button"
                            onClick={handleOpenTranslateModal}
                            DefaultIcon={ACTION_ICONS.translate.default}
                            disabled={isDisabled || isDirty}
                        />
                    </div>

                    <div className={styles.content}>
                        <div className={styles.image}>
                            <div className={styles['image-input']}>
                                <ImageInput
                                    variant="partnerBanner"
                                    label={PARTNERS_TEXT.BANNER.ADD_IMAGE_HERE}
                                    subText={COMMON_TEXT_ADMIN.INPUT.getImageSizeSubText(
                                        PARTNER_BANNER_VALIDATION.image.height,
                                        PARTNER_BANNER_VALIDATION.image.width,
                                    )}
                                    value={values.image}
                                    onChange={handleImageChange}
                                    id="banner-image"
                                    name="banner-image"
                                    disabled={isDisabled || !isBaseLanguage}
                                    setError={handleImageError}
                                    style={{
                                        backgroundImage: `
                                linear-gradient(rgba(245, 245, 245, 0.85), rgba(245, 245, 245, 0.85)),
                                url(${BannerImage})
                              `,
                                    }}
                                    cropWidth={PARTNER_BANNER_VALIDATION.image.width}
                                    cropHeight={PARTNER_BANNER_VALIDATION.image.height}
                                    minWidth={PARTNER_BANNER_VALIDATION.image.width}
                                    minHeight={PARTNER_BANNER_VALIDATION.image.height}
                                />
                            </div>
                            <div className={styles['image-error']}>
                                <InputError error={errors.image} />
                            </div>
                        </div>

                        <div className={styles.main}>
                            <div className={styles.fields}>
                                <RichTextInputGroup
                                    key={`title-${titleKey}-${language.code}`}
                                    label={PARTNERS_TEXT.FORM.LABEL.TITLE}
                                    value={displayedTitle}
                                    error={touched.title ? errors.title : undefined}
                                    onChange={handleTitleChange}
                                    onBlur={handleTitleBlur}
                                    name="title"
                                    id="title"
                                    maxLength={PARTNER_BANNER_VALIDATION.title.max}
                                    disabled={isDisabled || !isBaseLanguage}
                                    hideToolbar={!isBaseLanguage}
                                    isRequired={true}
                                    showCounterBelow={true}
                                    trimOnBlur={true}
                                />

                                <InputWithCharacterLimitGroup
                                    label={PARTNERS_TEXT.FORM.LABEL.DESCRIPTION}
                                    value={displayedDescription}
                                    error={touched.description ? errors.description : undefined}
                                    onChange={handleDescriptionChange}
                                    id="description"
                                    name="description"
                                    disabled={isDisabled || !isBaseLanguage}
                                    maxLength={PARTNER_BANNER_VALIDATION.description.max}
                                    showCounterBelow={true}
                                    isRequired={true}
                                />
                            </div>

                            {isBaseLanguage && (
                                <div className={styles.actions}>
                                    <Button
                                        type="button"
                                        buttonStyle="primary"
                                        onClick={handlePublishClick}
                                        disabled={isDisabled || !isDirty || !isFormValid(values, errors)}
                                    >
                                        {COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            <ConfirmationModal
                isOpen={isPublishModalOpen}
                title={COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES}
                onConfirm={handlePublishConfirm}
                onCancel={() => setIsPublishModalOpen(false)}
                onClose={() => setIsPublishModalOpen(false)}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
            />

            <TranslatePartnerBannerModal
                isOpen={isTranslateModalOpen}
                onClose={handleCloseTranslateModal}
                banner={values}
                onTranslateBanner={handleTranslateBannerSuccess}
                translatedLanguages={translationLanguages}
            />
        </div>
    );
};
