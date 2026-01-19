import { ABROAD_PAYMENT_DETAILS } from '@/const/public/donate-page';
import { CorrespondentBankBlock } from './CorrespondentBankBlock';
import { PublishedCorrespondentBankDetailsDto } from '@/types/public/donate-page';
import { useTranslation } from 'react-i18next';

export const CorrespondentBanksSection = ({
    correspondentBanks = [],
}: {
    correspondentBanks?: PublishedCorrespondentBankDetailsDto[];
}) => {
    const { t } = useTranslation('donatePage');
    if (correspondentBanks.length === 0) {
        return null;
    }

    const sortedCorrespondentBanks = correspondentBanks.toSorted((a, b) => b.id - a.id);
    const banks = sortedCorrespondentBanks.map((apiBank) => ({
        title: apiBank.name,
        fields: [
            { label: ABROAD_PAYMENT_DETAILS.SWIFT_LABEL, value: apiBank.swift },
            ...(apiBank.account ? [{ label: ABROAD_PAYMENT_DETAILS.ACCOUNT_LABEL, value: apiBank.account }] : []),
            ...(apiBank.foreignIban ? [{ label: ABROAD_PAYMENT_DETAILS.IBAN_LABEL, value: apiBank.foreignIban }] : []),
        ],
    }));

    return (
        <div className="abroadPaymentDetailsBlock">
            <h2>{t('CORRESPONDENT_BANKS_LABEL')}</h2>
            <div className="abroadPaymentDetailsContent">
                {banks.map((bank) => (
                    <CorrespondentBankBlock key={bank.title} title={bank.title} fields={bank.fields} />
                ))}
            </div>
        </div>
    );
};
