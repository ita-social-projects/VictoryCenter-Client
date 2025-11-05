import { Button } from '../../../../../components/admin/button/Button';
import { PARTNERS_TEXT } from '../../../../../const/admin/partners';
import { ReactComponent as PlusIcon } from '../../../../../assets/icons/plus.svg';
import './PartnerPageToolbar.scss';

export interface PartnerPageToolbarProps {
    onAddSection: () => void;
}

export const PartnerPageToolbar = ({ onAddSection }: PartnerPageToolbarProps) => {
    return (
        <div className="partner-page-toolbar" data-testid="partner-page-toolbar">
            <Button onClick={onAddSection} buttonStyle="primary">
                {PARTNERS_TEXT.BUTTON.ADD_PARTNER_SECTION}
                <PlusIcon />
            </Button>
        </div>
    );
};
