import { PaymentLabelWithCopy } from './PaymentLabelWithCopy';
import { MultiFieldLabelWithCopy } from './MultiFieldLabelWithCopy';
import { PAYMENT_DETAILS_COMMON, ABROAD_PAYMENT_DETAILS } from '@/const/public/donate-page';
import { useTranslation } from 'react-i18next';

interface PaymentDetailsSectionProps {
    title: string;
    ibanLabel: string;
    ibanValue: string;
    receiverName?: string | null;
    bankName?: string | null;
    swift?: string | null;
    address?: string | null;
}

export const PaymentDetailsSection = ({
    title,
    ibanLabel,
    ibanValue,
    receiverName,
    bankName,
    swift,
    address,
}: PaymentDetailsSectionProps) => {
    const { t } = useTranslation('donatePage');

    return (
        <div className="abroadPaymentDetailsBlock">
            <h2>{title}</h2>
            <div className="abroadPaymentDetailsContent">
                <PaymentLabelWithCopy
                    label={t('PAYMENT_DETAILS_COMMON_RECIPIENT_LABEL')}
                    value={receiverName || PAYMENT_DETAILS_COMMON.RECIPIENT_NAME_LABEL}
                    copyValue={receiverName || PAYMENT_DETAILS_COMMON.RECIPIENT_NAME_LABEL}
                />
                <PaymentLabelWithCopy label={ibanLabel} value={ibanValue} copyValue={ibanValue} />
                <PaymentLabelWithCopy
                    label={t('SWIFT_CODE_LABEL')}
                    value={swift || ABROAD_PAYMENT_DETAILS.SWIFT_CODE_VALUE_LABEL}
                    copyValue={swift || ABROAD_PAYMENT_DETAILS.SWIFT_CODE_VALUE_LABEL}
                />

                {bankName ? (
                    <PaymentLabelWithCopy label={t('BANK_RECEIVER_LABEL')} value={bankName} copyValue={bankName} />
                ) : (
                    <MultiFieldLabelWithCopy
                        label={t('BANK_RECEIVER_LABEL')}
                        values={[
                            ABROAD_PAYMENT_DETAILS.BANK_NAME_TRANSLITERATED_LABEL,
                            ABROAD_PAYMENT_DETAILS.BANK_STREET_TRANSLITERATED_LABEL,
                            ABROAD_PAYMENT_DETAILS.BANK_CITY_AND_COUNTRY_TRANSLITERATED_LABEL,
                        ]}
                        copyValue={
                            ABROAD_PAYMENT_DETAILS.BANK_NAME_TRANSLITERATED_LABEL +
                            ABROAD_PAYMENT_DETAILS.BANK_STREET_TRANSLITERATED_LABEL +
                            ABROAD_PAYMENT_DETAILS.BANK_CITY_AND_COUNTRY_TRANSLITERATED_LABEL
                        }
                    />
                )}

                {address ? (
                    <PaymentLabelWithCopy label={t('ADDRESS_LABEL')} value={address} copyValue={address} />
                ) : (
                    <MultiFieldLabelWithCopy
                        label={t('ADDRESS_LABEL')}
                        values={[ABROAD_PAYMENT_DETAILS.COUNTRY_LABEL, ABROAD_PAYMENT_DETAILS.CITY_LABEL]}
                        copyValue={ABROAD_PAYMENT_DETAILS.COUNTRY_LABEL + ABROAD_PAYMENT_DETAILS.CITY_LABEL}
                    />
                )}
            </div>
        </div>
    );
};
