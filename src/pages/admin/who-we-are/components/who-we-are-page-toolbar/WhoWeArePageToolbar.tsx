import './WhoWeArePageToolbar.scss';
import {
    LocalizationToolkit,
    LocalizationToolkitProps,
} from '@/components/admin/localization-toolkit/LocalizationToolkit';

export interface WhoWeArePageToolbarProps extends LocalizationToolkitProps {}

export const WhoWeArePageToolbar = ({
    languages,
    onLanguageChange,
    onTranslationStatusFilterChange,
}: WhoWeArePageToolbarProps) => {
    return (
        <div className="toolbar" data-testid="who-we-are-page-toolbar">
            <div className="toolbar-actions">
                <LocalizationToolkit
                    languages={languages}
                    onLanguageChange={onLanguageChange}
                    onTranslationStatusFilterChange={onTranslationStatusFilterChange}
                />
            </div>
        </div>
    );
};
