import { ABROAD_PAYMENT_DETAILS } from '../../../../../const/public/donate-page';
import { CorrespondentBankBlock } from './CorrespondentBankBlock';
import { PublishedCorrespondentBankDetailsDto } from '../../../../../types/public/donate-page';

export const CorrespondentBanksSection = ({
    correspondentBanks = [],
}: {
    correspondentBanks?: PublishedCorrespondentBankDetailsDto[];
}) => {
    if (correspondentBanks.length === 0) {
        return null;
    }

    const banks = correspondentBanks.map((apiBank) => ({
        title: apiBank.name,
        fields: [
            { label: ABROAD_PAYMENT_DETAILS.SWIFT_LABEL, value: apiBank.swift },
            { label: ABROAD_PAYMENT_DETAILS.ACCOUNT_LABEL, value: apiBank.account },
            ...(apiBank.foreignIban ? [{ label: ABROAD_PAYMENT_DETAILS.IBAN_LABEL, value: apiBank.foreignIban }] : []),
        ],
    }));

    return (
        <div className="abroadPaymentDetailsBlock">
            <h2>{ABROAD_PAYMENT_DETAILS.CORRESPONDENT_BANKS_LABEL}</h2>
            <div className="abroadPaymentDetailsContent">
                {banks.map((bank) => (
                    <CorrespondentBankBlock key={bank.title} title={bank.title} fields={bank.fields} />
                ))}
            </div>
        </div>
    );
};
