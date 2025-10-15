import { PartnerPageToolbar } from '../partner-page-toolbar/PartnerPageToolbar';
import { PartnerBannerForm } from '../partner-banner-form/PartnerBannerForm';
import { PartnerSectionForm } from '../partner-section-form/PartnerSectionForm';

export const PartnerPanelContent = () => {
    const handleAddPartnerModalOpen = () => {};

    return (
        <div className="partner-panel-wrapper" data-testid="partner-panel-content">
            <div className="partner-panel-toolbar-container">
                <PartnerPageToolbar onAddPartner={handleAddPartnerModalOpen} />
            </div>
            <div>
                
            </div>
        </div>
    );
};
