import './AlternativeSupportWays.scss';
import { CopyTextButton } from '../../copy-text-button/CopyTextButton';
import { ReactComponent as ArrowUpRight } from '../../../../../assets/icons/arrow-up-right.svg';
import { ReactComponent as ShareForwardArrow } from '../../../../../assets/icons/forward.svg';
import { ALTERNATIVE_SUPPORT_WAYS } from '../../../../../const/public/donate-page';
import { PublicSupportOptionsDto } from '../../../../../types/public/donate-page';

interface AlternativeSupportWaysProps {
    supportOptions: PublicSupportOptionsDto[];
}

export const AlternativeSupportWays = ({ supportOptions }: AlternativeSupportWaysProps) => {
    const payPal = supportOptions.find((x) => x.name.toLowerCase() === 'paypal');
    const monobank = supportOptions.find((x) => x.name.toLowerCase() === 'monobank');

    const payPalValue = payPal?.value || ALTERNATIVE_SUPPORT_WAYS.PAY_PAL_EMAIL_LABEL;
    const monobankLink = monobank?.value || ALTERNATIVE_SUPPORT_WAYS.MONOBANK_JAR_LINK_LABEL;

    return (
        <div className="alternativeSupportWays">
            <h2>{ALTERNATIVE_SUPPORT_WAYS.ALTERNATIVE_SUPPORT_WAYS_LABEL}</h2>

            <div className="labelContainer">
                <h3>{ALTERNATIVE_SUPPORT_WAYS.PAY_PAL_LABEL}</h3>
                <div className="labelWithCopyButton">
                    <span className="label">{payPalValue}</span>
                    <CopyTextButton textToCopy={payPalValue} />
                </div>
            </div>

            <div className="labelContainer">
                <h3>{ALTERNATIVE_SUPPORT_WAYS.MONOBANK_JAR_LABEL}</h3>
                <div className="labelWithCopyButton">
                    <a className="label" href={monobankLink} target="_blank" rel="noreferrer">
                        {monobankLink}
                    </a>
                    <CopyTextButton textToCopy={monobankLink} />
                </div>
            </div>

            <div className="buttonsContainer">
                <button className="downloadPaymentDetailsButton">
                    {ALTERNATIVE_SUPPORT_WAYS.DOWNLOAD_PAYMENT_DETAILS_BUTTON_LABEL}
                    <ArrowUpRight />
                </button>
                <button className="shareButton">
                    <ShareForwardArrow />
                </button>
            </div>
        </div>
    );
};
