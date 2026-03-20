import { useState, useEffect } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { CategoryBar } from '@/components/admin/category-bar/CategoryBar';
import { CompanyProfileTab } from '../company-profile-tab/CompanyProfileTab';
import { CompanyProfileRequisitesTab } from '../company-profile-requisites-tab/CompanyProfileRequisitesTab';
import { CompanyProfileSocialMediaTab } from '../company-profile-social-media-tab/CompanyProfileSocialMediaTab';
import { ToastContainer } from '@/components/admin/toast/toast-container/ToastContainer';
import { ProfileToolbar } from '../company-profile-toolbar/CompanyProfileToolbar';
import { CompanyProfileLogoHeader } from '../company-profile-logo-header/CompanyProfileLogoHeader';
import { CompanyProfileCancelModal } from '../company-profile-cancel-modal/CompanyProfileCancelModal';
import './CompanyProfileContent.scss';
import { COMPANY_PROFILE_TEXT } from '@/const/admin/company-profile';
import { COMPANY_PROFILE_FORM_DEFAULTS, CompanyProfileFormValues } from '@/types/admin/company-profile';

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
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [isEditMode, setIsEditMode] = useState(false);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

    const methods = useForm<CompanyProfileFormValues>({
        mode: 'onBlur',
        defaultValues: COMPANY_PROFILE_FORM_DEFAULTS,
    });

    const handlePublish = (_data: CompanyProfileFormValues) => {
        // TODO (API)
    };

    const handleCancelClick = () => {
        if (methods.formState.isDirty) {
            setIsCancelModalOpen(true);
        } else {
            setIsEditMode(false);
        }
    };

    const handleConfirmCancel = () => {
        methods.reset();
        setIsEditMode(false);
        setIsCancelModalOpen(false);
    };

    const handleTabSelect = (tab: TabItem) => {
        if (isEditMode) return;
        setActiveTab(tab.id);
    };

    const selectedTab = TABS.find((tab) => tab.id === activeTab) || TABS[0];

    return (
        <div className="wrapper">
            <div className="toolbar">
                <div className="toolbar-top" />
                <div className="toolbar-bottom">
                    <div className={`tabs-wrapper${isEditMode ? ' tabs-wrapper--disabled' : ''}`}>
                        <CategoryBar<TabItem>
                            categories={TABS}
                            selectedCategory={selectedTab}
                            getCategoryDisplayName={(tab) => tab.label}
                            getCategoryKey={(tab) => tab.id}
                            onCategorySelect={handleTabSelect}
                        />
                    </div>

                    <div className="toolbar-actions">
                        <ProfileToolbar
                            isEditMode={isEditMode}
                            onEdit={() => setIsEditMode(true)}
                            onCancel={handleCancelClick}
                            onPublish={methods.handleSubmit(handlePublish)}
                            isPublishDisabled={!methods.formState.isDirty}
                        />
                    </div>
                </div>
            </div>

            <div className="main-content">
                <CompanyProfileLogoHeader isEditMode={isEditMode} />

                <FormProvider {...methods}>
                    <form className="company-form">
                        <div className="tab-content">
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

            <ToastContainer />
        </div>
    );
};
