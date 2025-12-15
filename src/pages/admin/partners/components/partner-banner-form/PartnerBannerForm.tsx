import React, { useCallback, useState, useEffect } from 'react';
import { ImageValues, Image } from '@/types/common/image';
import styles from './PartnerBannerForm.module.scss';
import './PartnerBannerForm.scss';
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
import { PartnerBanner as PartnerBannerType } from '@/types/admin/partners';
import { PARTNER_BANNER_VALIDATION_FUNCTIONS } from '@/validation/admin/partner-schema/partner-schema';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { ImageInput } from '@/components/admin/image-input/ImageInput';
import { InputError } from '@/components/admin/input-error/InputError';
import BannerImage from '@/assets/images/public/partners-page/horses.png';

export interface PartnerBannerValues {
    title: string;
    description: string;
    image: ImageValues | Image | null;
    imageId: number | null;
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

    const titleError = PARTNER_BANNER_VALIDATION_FUNCTIONS.validateTitle(values.title);
    const descError = PARTNER_BANNER_VALIDATION_FUNCTIONS.validateDescription(values.description);

    return !titleError && !descError && !errors.image;
};

export const PartnerBanner = () => {
    const client = useAdminClient();
    const { addToast } = useToast();
    const [values, setValues] = useState<PartnerBannerValues | null>(null);
    const [errors, setErrors] = useState<PartnerBannerErrorState>({});
    const [isPublishing, setIsPublishing] = useState(false);

    const fetchBannerHandler = useCallback(() => {
        return PartnersApi.getBanner(client);
    }, [client]);

    const {
        data: bannerData,
        isLoading: isLoadingData,
        error: fetchError,
        refetch: refetchBanner,
    } = useDataFetch<PartnerBannerType>({
        initialData: { title: '', description: '', image: null, imageId: null },
        fetchHandler: fetchBannerHandler,
        autoFetchDisabled: false,
    });

    useEffect(() => {
        if (bannerData) {
            setValues(bannerData);
        }
    }, [bannerData]);

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

    const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setValues((prev) => (prev ? { ...prev, title: newValue } : null));
        setErrors((prev) => ({
            ...prev,
            title: PARTNER_BANNER_VALIDATION_FUNCTIONS.validateTitle(newValue),
        }));
    }, []);

    const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setValues((prev) => (prev ? { ...prev, description: newValue } : null));
        setErrors((prev) => ({
            ...prev,
            description: PARTNER_BANNER_VALIDATION_FUNCTIONS.validateDescription(newValue),
        }));
    }, []);

    const handleImageChange = useCallback((value: ImageValues | null) => {
        setValues((prev) => (prev ? { ...prev, image: value, imageId: value ? prev.imageId : null } : null));
    }, []);

    const handleImageError = useCallback((error: string | null) => {
        setErrors((prev) => ({
            ...prev,
            image: error ? error : undefined,
        }));
    }, []);

    const handlePublish = useCallback(async () => {
        if (!values || !isFormValid(values, errors)) return;

        setIsPublishing(true);
        try {
            const updatedBanner = await PartnersApi.updateBanner(client, {
                title: values.title,
                description: values.description,
                image: values.image,
                imageId: values.imageId,
            });

            setValues(updatedBanner);
            addToast(PARTNERS_TEXT.MESSAGE.BANNER_SAVED, ToastType.Success);
        } catch (error: any) {
            if (axios.isCancel?.(error) || error.name === 'CanceledError' || error.name === 'AbortError') {
                return;
            }
            addToast(PARTNERS_TEXT.MESSAGE.FAIL_TO_UPDATE_BANNER, ToastType.Error);
        } finally {
            setIsPublishing(false);
        }
    }, [values, errors, client, addToast]);

    if (isLoadingData) {
        return (
            <div className={styles['loader']}>
                <InlineLoader size={2} />
            </div>
        );
    }

    if (fetchError || !values) {
        return (
            <div className={styles['error']}>
                <p>{PARTNERS_TEXT.MESSAGE.FAIL_TO_LOAD_BANNER}</p>
                <Button onClick={refetchBanner} buttonStyle="primary">
                    {PARTNERS_TEXT.BUTTON.TRY_AGAIN}
                </Button>
            </div>
        );
    }

    const isDisabled = isPublishing;

    return (
        <div className={styles['root']}>
            {isLoadingData && (
                <div className={styles['loader']}>
                    <InlineLoader size={2} />
                </div>
            )}

            {fetchError && !isLoadingData && (
                <div className={styles['error']}>
                    <p>{PARTNERS_TEXT.MESSAGE.FAIL_TO_LOAD_BANNER}</p>
                    <Button onClick={refetchBanner} buttonStyle="primary">
                        {PARTNERS_TEXT.BUTTON.TRY_AGAIN}
                    </Button>
                </div>
            )}

            {!isLoadingData && !fetchError && values && (
                <div className={styles['content']}>
                    <div className={styles['image']}>
                        <ImageInput
                            label={PARTNERS_TEXT.BANNER.ADD_IMAGE_HERE}
                            subText={COMMON_TEXT_ADMIN.INPUT.getImageSizeSubText(
                                PARTNER_BANNER_VALIDATION.image.height,
                                PARTNER_BANNER_VALIDATION.image.width,
                            )}
                            value={values.image}
                            onChange={handleImageChange}
                            id="banner-image"
                            name="banner-image"
                            disabled={isDisabled}
                            setError={handleImageError}
                            className="image-input-featured"
                            style={{
                                backgroundImage: `
                                linear-gradient(rgba(245, 245, 245, 0.85), rgba(245, 245, 245, 0.85)),
                                url(${BannerImage})
                              `,
                            }}
                        />
                        <InputError error={errors.image} />
                    </div>

                    <div className={styles['main']}>
                        <div className={styles['fields']}>
                            <InputWithCharacterLimitGroup
                                label={PARTNERS_TEXT.FORM.LABEL.TITLE}
                                value={values.title}
                                error={errors.title}
                                onChange={handleTitleChange}
                                name="title"
                                id="title"
                                maxLength={PARTNER_BANNER_VALIDATION.title.max}
                                disabled={isDisabled}
                                isRequired={true}
                            />

                            <InputWithCharacterLimitGroup
                                label={PARTNERS_TEXT.FORM.LABEL.DESCRIPTION}
                                value={values.description}
                                error={errors.description}
                                onChange={handleDescriptionChange}
                                id="description"
                                name="description"
                                disabled={isDisabled}
                                maxLength={PARTNER_BANNER_VALIDATION.description.max}
                                isRequired={true}
                            />
                        </div>

                        <div className={styles['actions']}>
                            <Button
                                type="button"
                                buttonStyle="primary"
                                onClick={handlePublish}
                                disabled={isDisabled || !isFormValid(values, errors)}
                            >
                                {COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
