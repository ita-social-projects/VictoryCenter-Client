import { VisitorPagesProvider } from '../../../contexts/admin/visitor-pages-provider/VisitorPagesProvider';
import { FaqPanelContent } from './components/faq-panel-content/FaqPanelContent';

export const FaqPanel = () => {
    return (
        <VisitorPagesProvider>
            <FaqPanelContent />
        </VisitorPagesProvider>
    );
};
