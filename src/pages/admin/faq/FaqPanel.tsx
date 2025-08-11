import { FaqPanelToolbar } from './components/faq-panel-toolbar/FaqPanelToolbar';

export const FaqPanel = () => {
    return (
        <>
            <div className="programs-page-toolbar-container">
                <FaqPanelToolbar onSearchQueryChange={(a) => {}} onStatusFilterChange={(a) => {}} onAddFaq={() => {}} />
            </div>
        </>
    );
};
