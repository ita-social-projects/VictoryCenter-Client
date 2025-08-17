import { COMMON_TEXT_ADMIN } from '../../../../../const/admin/common';
import { BankDetailsType } from '../../../../../types/admin/donate';
import NotFoundIcon from '../../../../../assets/icons/not-found.svg';
import './BankDetails.scss';
import { Button } from '../../../../../components/admin/button/Button';
import { useCallback, useRef, useState } from 'react';
import { AddBankDetailsForm, AddBankDetailsFormRef, AddBankDetailsFormValues } from './forms/AddBankDetailsForm';
import { Input } from '../input/Input';
import { VisibilityStatus } from '../../../../../types/admin/common';

export interface BankDetailsProps {
    items: BankDetailsType[];
    renderItem: (item: BankDetailsType) => React.ReactNode;
    isLoading: boolean;
}

export const BankDetails = ({ items, renderItem, isLoading }: BankDetailsProps) => {
    const formRef = useRef<AddBankDetailsFormRef>(null);
    const [isAddFormVisible, setIsAddFormVisible] = useState(false);
    const [pendingAction, setPendingAction] = useState<'publish' | null>(null);
    const [pendingFormData, setPendingFormData] = useState<AddBankDetailsFormValues | null>(null);
    const [isFormValid, setIsFormValid] = useState(false);

    const handleFormValidationChange = useCallback((isValid: boolean) => {
        setIsFormValid(isValid);
    }, []);

    const handleAddDetails = () => {
        setIsAddFormVisible(true);
    };

    const handleAddDetailsClose = () => {
        setIsAddFormVisible(false);
    };

    const handleFormSubmit = useCallback((data: AddBankDetailsFormValues, status: VisibilityStatus) => {
        const currentIsValid = formRef.current?.isValid(false) || false;

        if (!currentIsValid) {
            return;
        }

        setPendingFormData(data);
        setPendingAction(status === VisibilityStatus.Published ? 'publish' : null);
    }, []);
    let content;

    if (items.length > 0) {
        content = items.map(renderItem);
    } else if (!isLoading && !isAddFormVisible) {
        content = (
            <div className="donate-page-credits-not-found" data-testid="bank-details-not-found">
                <img src={NotFoundIcon} alt={COMMON_TEXT_ADMIN.ALT.NOT_FOUND} />
                <p>{COMMON_TEXT_ADMIN.DONATE.BANK_DETAILS.NOT_FOUND}</p>
                <Button className="donate-page-credits-btn-add" onClick={handleAddDetails} buttonStyle="secondary">
                    {COMMON_TEXT_ADMIN.DONATE.BANK_DETAILS.ADD_NEW}
                </Button>
            </div>
        );
    } else if (isAddFormVisible) {
        content = (
            <AddBankDetailsForm
                isOpen={isAddFormVisible}
                onClose={handleAddDetailsClose}
                onSubmit={handleFormSubmit}
                onValidationChange={handleFormValidationChange}
            />
        );
    } else {
        content = null;
    }
    return (
        <>
            <div className="donate-page-credits">{content}</div>
        </>
    );
};
