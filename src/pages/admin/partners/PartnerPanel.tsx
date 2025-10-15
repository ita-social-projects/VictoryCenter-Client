import { VisitorPagesProvider } from '../../../contexts/admin/visitor-pages-provider/VisitorPagesProvider';
import { PartnerPanelContent } from '../partners/components/partner-panel-content/PartnerPanelContent';

export const PartnerPanel = () => {
    return (
        <VisitorPagesProvider>
            <PartnerPanelContent />
        </VisitorPagesProvider>
    );
};
