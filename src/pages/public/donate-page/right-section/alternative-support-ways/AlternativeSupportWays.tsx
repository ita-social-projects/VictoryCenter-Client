import './AlternativeSupportWays.scss';
import { CopyTextButton } from '../../copy-text-button/CopyTextButton';
import { ReactComponent as ArrowUpRight } from '../../../../../assets/icons/arrow-up-right.svg';
import { ReactComponent as ShareForwardArrow } from '../../../../../assets/icons/forward.svg';
import { ALTERNATIVE_SUPPORT_WAYS } from '../../../../../const/public/donate-page';
import { PublishedSupportOptionsDto, Currency } from '../../../../../types/public/donate-page';

interface AlternativeSupportWaysProps {
    supportOptions: PublishedSupportOptionsDto[];
    currentCurrency: Currency;
}

export const AlternativeSupportWays = ({ supportOptions, currentCurrency }: AlternativeSupportWaysProps) => {
    const currentCurrencyOptions = supportOptions.filter((option) => option.currency === currentCurrency);

    if (currentCurrencyOptions.length === 0) {
        return null;
    }

    return (
        <div className="alternativeSupportWays">
            <h2>{ALTERNATIVE_SUPPORT_WAYS.ALTERNATIVE_SUPPORT_WAYS_LABEL}</h2>

            {currentCurrencyOptions.map((option) => (
                <div key={option.id} className="labelContainer">
                    <h3>{option.name}</h3>
                    <div className="labelWithCopyButton">
                        <span className="label">{option.value}</span>
                        <CopyTextButton textToCopy={option.value} />
                    </div>
                </div>
            ))}

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
