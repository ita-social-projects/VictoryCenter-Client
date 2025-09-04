import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { SupportOptionsType } from '../../../../../types/admin/donate';
import NotFoundIcon from '../../../../../assets/icons/not-found.svg';
import { Button } from '../../../../../components/admin/button/Button';
import { useState } from 'react';
import { SupportOptionsForm } from './SupportOptionsForm';

export interface SupportOptionsProps {
    items: SupportOptionsType[];
    renderItem: (item: SupportOptionsType) => React.ReactNode;
    isLoading: boolean;
    className?: string;
}

export const SupportOptions = ({ items, renderItem, isLoading, className }: SupportOptionsProps) => {
    const [isFormVisible, setIsFormVisible] = useState(false);

    const handleShowForm = () => {
        setIsFormVisible(true);
    };

    const handleHideForm = () => {
        setIsFormVisible(false);
    };

    const shouldShowNotFound = items.length === 0 && !isFormVisible;
    return (
        <div className={`donate-page-support-options ${className ?? ''}`}>
            {shouldShowNotFound ? (
                <div className="donate-page-support-options not-found" data-testid="support-options-not-found">
                    <img src={NotFoundIcon} alt={COMMON_TEXT_ADMIN.ALT.NOT_FOUND} />
                    <p>{COMMON_TEXT_ADMIN.DONATE.SUPPORT_OPTIONS.NOT_FOUND}</p>
                    <Button
                        className="donate-page-support-options btn-add"
                        onClick={handleShowForm}
                        buttonStyle="secondary"
                    >
                        {COMMON_TEXT_ADMIN.DONATE.SUPPORT_OPTIONS.ADD_NEW}
                    </Button>
                </div>
            ) : (
                <SupportOptionsForm initialData={items} onClose={handleHideForm} />
            )}
        </div>
    );
};
