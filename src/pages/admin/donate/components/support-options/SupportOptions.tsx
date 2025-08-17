import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { SupportOptionsType } from '../../../../../types/admin/donate';
import NotFoundIcon from '../../../../../assets/icons/not-found.svg';

export interface SupportOptionsProps {
    items: SupportOptionsType[];
    renderItem: (item: SupportOptionsType) => React.ReactNode;
    isLoading: boolean;
}

export const SupportOptions = ({ items, renderItem, isLoading }: SupportOptionsProps) => {
    let content;

    if (items.length > 0) {
        content = items.map(renderItem);
    } else if (!isLoading) {
        content = (
            <div className="donate-page-credits-not-found" data-testid="support-options-not-found">
                <img src={NotFoundIcon} alt={COMMON_TEXT_ADMIN.ALT.NOT_FOUND} />
                <p>{COMMON_TEXT_ADMIN.DONATE.SUPPORT_OPTIONS.NOT_FOUND}</p>
            </div>
        );
    } else {
        content = null;
    }
    return <div className="donate-page-credits">{content}</div>;
};
