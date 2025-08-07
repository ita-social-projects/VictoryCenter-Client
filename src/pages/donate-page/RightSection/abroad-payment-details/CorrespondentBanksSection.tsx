import { CorrespondentBankBlock } from './CorrespondentBankBlock';
import { USD_CORRESPONDENT_BANKS } from './AbroadPaymentDetails';
import { ABROAD_PAYMENT_DETAILS } from '../../../../const/public/donate-page';

export const CorrespondentBanksSection = ({ banks }: { banks: typeof USD_CORRESPONDENT_BANKS }) => (
    <div className="abroadPaymentDetailsBlock">
        <h2>{ABROAD_PAYMENT_DETAILS.CORRESPONDENT_BANKS_LABEL}</h2>
        <div className="abroadPaymentDetailsContent">
            {banks.map((bank) => (
                <CorrespondentBankBlock key={bank.title} title={bank.title} fields={bank.fields} />
            ))}
        </div>
    </div>
);
