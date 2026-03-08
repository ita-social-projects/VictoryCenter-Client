import { LanguageToolkit, LanguageToolkitProps } from '@/components/admin/language-toolkit/LanguageToolkit';
import './WhoWeArePageToolbar.scss';

export interface WhoWeArePageToolbarProps extends LanguageToolkitProps {}

export const WhoWeArePageToolbar = ({ languages, onLanguageChange }: WhoWeArePageToolbarProps) => {
    return (
        <div className="toolbar" data-testid="who-we-are-page-toolbar">
            <div className="toolbar-actions">
                <LanguageToolkit languages={languages} onLanguageChange={onLanguageChange} />
            </div>
        </div>
    );
};
