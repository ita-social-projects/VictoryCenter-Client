import { useState, useEffect, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import cn from 'classnames';
import { CategoryBar } from '@/components/admin/category-bar/CategoryBar';
import { CompanyProfileTab } from '../company-profile-tab/CompanyProfileTab';
import { CompanyProfileRequisitesTab } from '../company-profile-requisites-tab/CompanyProfileRequisitesTab';
import { CompanyProfileSocialMediaTab } from '../company-profile-social-media-tab/CompanyProfileSocialMediaTab';
import { ToastContainer } from '@/components/admin/toast/toast-container/ToastContainer';
import { ProfileToolbar } from '../company-profile-toolbar/CompanyProfileToolbar';
import { CompanyProfileLogoHeader } from '../company-profile-logo-header/CompanyProfileLogoHeader';
import { CompanyProfileCancelModal } from '../company-profile-cancel-modal/CompanyProfileCancelModal';
import styles from './CompanyProfileContent.module.scss';
import { COMPANY_PROFILE_TEXT } from '@/const/admin/company-profile';
import { COMPANY_PROFILE_FORM_DEFAULTS, CompanyProfileFormValues } from '@/types/admin/company-profile';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { CompanyProfileApi } from '@/services/api/admin/company-profile/company-profile-api';
import {
    mapCompanyProfileToFormValues,
    mapFormValuesToCompanyProfilePatch,
} from '@/utils/functions/mappers/admin/company-profile/company-profile-mappers';
import { yupResolver } from '@hookform/resolvers/yup';
import { CompanyProfileValidationSchema } from '@/validation/admin/company-profile-schema/company-profile-schema';
import { useToast } from '@/contexts/admin/toast-context-provider/ToastContextProvider';
import { ToastType } from '@/types/admin/toast';
import { CompanyProfilePublishModal } from '../company-profile-publish-modal/CompanyProfilePublishModal';

type TabType = 'profile' | 'requisites' | 'socials';

type TabItem = {
    id: TabType;
    label: string;
};

const TABS: TabItem[] = [
    { id: 'profile', label: COMPANY_PROFILE_TEXT.TABS.PROFILE },
    { id: 'requisites', label: COMPANY_PROFILE_TEXT.TABS.REQUISITES },
    { id: 'socials', label: COMPANY_PROFILE_TEXT.TABS.SOCIALS },
];

export const CompanyProfileContent = () => {
    const client = useAdminClient();
    const { addToast } = useToast();

    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [isEditMode, setIsEditMode] = useState(false);

    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [pendingPublishData, setPendingPublishData] = useState<CompanyProfileFormValues | null>(null);

    const savedValuesRef = useRef<CompanyProfileFormValues>(COMPANY_PROFILE_FORM_DEFAULTS);

    const methods = useForm<CompanyProfileFormValues>({
        mode: 'onBlur',
        reValidateMode: 'onChange',
        defaultValues: COMPANY_PROFILE_FORM_DEFAULTS,
        resolver: yupResolver(CompanyProfileValidationSchema),
        shouldFocusError: true,
    });

    const handlePublishSubmit = (data: CompanyProfileFormValues) => {
        setPendingPublishData(data);
        setIsPublishModalOpen(true);
    };

    const handleConfirmPublish = async () => {
        if (!pendingPublishData) return;

        const { languages } = await CompanyProfileApi.get(client);
        const patch = mapFormValuesToCompanyProfilePatch(pendingPublishData, languages);

        const { profile, languages: updatedLanguages } = await CompanyProfileApi.publish(client, patch);

        const nextValues = mapCompanyProfileToFormValues(profile, updatedLanguages);
        savedValuesRef.current = nextValues;

        methods.reset(nextValues);
        setIsEditMode(false);
        setIsPublishModalOpen(false);
        setPendingPublishData(null);

        addToast('Зміни успішно опубліковано', ToastType.Success, 3000);
    };

    const handleCancelPublish = () => {
        methods.reset(savedValuesRef.current);
        setIsEditMode(false);
        setIsPublishModalOpen(false);
        setPendingPublishData(null);
    };

    const handleCancelClick = () => {
        if (methods.formState.isDirty) {
            setIsCancelModalOpen(true);
        } else {
            setIsEditMode(false);
        }
    };

    const handleConfirmCancel = () => {
        methods.reset(savedValuesRef.current);
        setIsEditMode(false);
        setIsCancelModalOpen(false);
    };

    const handleTabSelect = (tab: TabItem) => {
        if (isEditMode) return;
        setActiveTab(tab.id);
    };

    const selectedTab = TABS.find((tab) => tab.id === activeTab) || TABS[0];

    useEffect(() => {
        let mounted = true;

        const loadProfile = async () => {
            const { profile, languages } = await CompanyProfileApi.get(client);
            if (!mounted) return;

            const values = mapCompanyProfileToFormValues(profile, languages);
            savedValuesRef.current = values;
            methods.reset(values);
        };

        void loadProfile();

        return () => {
            mounted = false;
        };
    }, [client, methods]);

    return (
        <div className={styles.wrapper}>
            <div className={styles.toolbar}>
                <div className={styles['toolbar-top']} />
                <div className={styles['toolbar-bottom']}>
                    <div
                        className={cn(styles['tabs-wrapper'], {
                            [styles['tabs-wrapper-disabled']]: isEditMode,
                        })}
                    >
                        <CategoryBar<TabItem>
                            categories={TABS}
                            selectedCategory={selectedTab}
                            getCategoryDisplayName={(tab) => tab.label}
                            getCategoryKey={(tab) => tab.id}
                            onCategorySelect={handleTabSelect}
                        />
                    </div>

                    <div className={styles['toolbar-actions']}>
                        <ProfileToolbar
                            isEditMode={isEditMode}
                            onEdit={() => setIsEditMode(true)}
                            onCancel={handleCancelClick}
                            onPublish={methods.handleSubmit(handlePublishSubmit)}
                            isPublishDisabled={!methods.formState.isDirty || !methods.formState.isValid}
                        />
                    </div>
                </div>
            </div>

            <div className={styles['main-content']}>
                <CompanyProfileLogoHeader isEditMode={isEditMode} />

                <FormProvider {...methods}>
                    <form className={styles['company-form']}>
                        <div className={styles['tab-content']}>
                            {activeTab === 'profile' && <CompanyProfileTab disabled={!isEditMode} />}
                            {activeTab === 'requisites' && <CompanyProfileRequisitesTab disabled={!isEditMode} />}
                            {activeTab === 'socials' && <CompanyProfileSocialMediaTab disabled={!isEditMode} />}
                        </div>
                    </form>
                </FormProvider>
            </div>

            <CompanyProfileCancelModal
                isOpen={isCancelModalOpen}
                onConfirm={handleConfirmCancel}
                onCancel={() => setIsCancelModalOpen(false)}
            />

            <CompanyProfilePublishModal
                isOpen={isPublishModalOpen}
                onConfirm={handleConfirmPublish}
                onCancel={handleCancelPublish}
            />

            <ToastContainer />
        </div>
    );
};
