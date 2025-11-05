import React, { useCallback, useState, useEffect } from 'react';
import { ImageValues, Image } from '../../../../../types/common/image';
import './PartnerBannerForm.scss';
import { PARTNER_BANNER_VALIDATION, PARTNERS_TEXT } from '../../../../../const/admin/partners';
import { useDataFetch } from '../../../../../hooks/common/use-data-fetch/useDataFetch';
import { PartnersApi } from '../../../../../services/api/admin/partners/partners-api';
import { useAdminClient } from '../../../../../hooks/admin/use-admin-client/useAdminClient';
import { useToast } from '../../../../../contexts/admin/toast-context-provider/ToastContextProvider';
import { ToastType } from '../../../../../types/admin/toast';
import { InlineLoader } from '../../../../../components/common/inline-loader/InlineLoader';
import { Button } from '../../../../../components/admin/button/Button';
import { PhotoInputGroup } from '../../../../../components/admin/input-groups/photo-input-group/PhotoInputGroup';
import { InputWithCharacterLimitGroup } from '../../../../../components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '../../../../../components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import axios from 'axios';
import { PartnerBanner as PartnerBannerType } from '../../../../../types/admin/partners';
import { PARTNER_BANNER_VALIDATION_FUNCTIONS } from '../../../../../validation/admin/partner-schema/partner-schema';
import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';

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

    const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        setValues((prev) => (prev ? { ...prev, description: newValue } : null));
        setErrors((prev) => ({
            ...prev,
            description: PARTNER_BANNER_VALIDATION_FUNCTIONS.validateDescription(newValue),
        }));
    }, []);

    const handleImageChange = useCallback((value: ImageValues | null) => {
        setValues((prev) => (prev ? { ...prev, image: value, imageId: value ? prev.imageId : null } : null));
        setErrors((prev) => ({
            ...prev,
            image: PARTNER_BANNER_VALIDATION_FUNCTIONS.validateImage(value),
        }));
    }, []);

    const isFormValid = (): boolean => {
        if (!values) return false;

        if (Object.values(errors).some((err) => !!err)) {
            return false;
        }

        const titleError = PARTNER_BANNER_VALIDATION_FUNCTIONS.validateTitle(values.title);
        const descError = PARTNER_BANNER_VALIDATION_FUNCTIONS.validateDescription(values.description);
        const imgError = PARTNER_BANNER_VALIDATION_FUNCTIONS.validateImage(values.image);

        return !titleError && !descError && !imgError;
    };

    const handlePublish = useCallback(async () => {
        if (!values || !isFormValid()) return;

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
    }, [values, client, addToast]);

    if (isLoadingData) {
        return (
            <div className="partner-banner__loader">
                <InlineLoader size={2} />
            </div>
        );
    }

    if (fetchError || !values) {
        return (
            <div className="partner-banner__error">
                <p>{PARTNERS_TEXT.MESSAGE.FAIL_TO_LOAD_BANNER}</p>
                <Button onClick={refetchBanner} buttonStyle="primary">
                    Спробувати ще
                </Button>
            </div>
        );
    }

    const isDisabled = isPublishing;

    return (
        <div className="partner-banner">
            {isLoadingData && (
                <div className="partner-banner__loader">
                    <InlineLoader size={2} />
                </div>
            )}

            {fetchError && !isLoadingData && (
                <div className="partner-banner__error">
                    <p>{PARTNERS_TEXT.MESSAGE.FAIL_TO_LOAD_BANNER}</p>
                    <Button onClick={refetchBanner} buttonStyle="primary">
                        Спробувати ще
                    </Button>
                </div>
            )}

            {!isLoadingData && !fetchError && values && (
                <div className="partner-banner__content">
                    <div className="partner-banner__image">
                        <PhotoInputGroup
                            label={PARTNERS_TEXT.FORM.LABEL.IMAGE}
                            value={values.image}
                            error={errors.image}
                            onChange={handleImageChange}
                            id="banner-image"
                            name="banner-image"
                            disabled={isDisabled}
                            isRequired={true}
                            setError={() => {}}
                        />
                    </div>

                    <div className="partner-banner__main">
                        <div className="partner-banner__fields">
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

                            <TextAreaWithCharacterLimitGroup
                                label={PARTNERS_TEXT.FORM.LABEL.DESCRIPTION}
                                value={values.description}
                                error={errors.description}
                                onChange={handleDescriptionChange}
                                id="description"
                                name="description"
                                disabled={isDisabled}
                                maxLength={PARTNER_BANNER_VALIDATION.description.max}
                                rows={2}
                                isRequired={true}
                            />
                        </div>

                        <div className="partner-banner__actions">
                            <Button
                                type="button"
                                buttonStyle="primary"
                                onClick={handlePublish}
                                disabled={isDisabled || !isFormValid()}
                            >
                                {COMMON_TEXT_ADMIN.BUTTON.PUBLISH}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
