import { Button } from '@/components/admin/button/Button';
import { PARTNERS_TEXT } from '@/const/admin/partners';
import { ReactComponent as PlusIcon } from '@/assets/icons/plus.svg';
import { LanguageToolkit, LanguageToolkitProps } from '@/components/admin/language-toolkit/LanguageToolkit';
import styles from './PartnerPageToolbar.module.scss';

export interface PartnerPageToolbarProps extends LanguageToolkitProps {
    onAddSection: () => void;
    disableAddSection?: boolean;
}

export const PartnerPageToolbar = ({
    onAddSection,
    disableAddSection = false,
    languages,
    onLanguageChange,
}: PartnerPageToolbarProps) => {
    return (
        <div className={styles['partner-page-toolbar']} data-testid="partner-page-toolbar">
            <LanguageToolkit languages={languages} onLanguageChange={onLanguageChange} />
            <Button onClick={onAddSection} buttonStyle="primary" disabled={disableAddSection}>
                {PARTNERS_TEXT.BUTTON.ADD_PARTNER_SECTION}
                <PlusIcon />
            </Button>
        </div>
    );
};
