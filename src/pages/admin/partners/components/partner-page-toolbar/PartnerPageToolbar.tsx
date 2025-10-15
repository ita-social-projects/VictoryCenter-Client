import { Button } from '../../../../../components/admin/button/Button';
import { PARTNERS_TEXT } from '../../../../../const/admin/partners';
import { ReactComponent as PlusIcon } from '../../../../../assets/icons/plus.svg';
import './PartnerPageToolbar.scss';

export interface PartnerPageToolbarProps {
    onAddPartner: () => void;
}

export const PartnerPageToolbar = ({ onAddPartner }: PartnerPageToolbarProps) => {
    return (
        <div className="toolbar par-toolbar" data-testid="partner-page-toolbar">
            <div className="toolbar-actions">
                <Button onClick={onAddPartner} buttonStyle="primary">
                    {PARTNERS_TEXT.BUTTON.ADD_PARTNER_SECTION}
                    <PlusIcon />
                </Button>
            </div>
        </div>
    );
};
