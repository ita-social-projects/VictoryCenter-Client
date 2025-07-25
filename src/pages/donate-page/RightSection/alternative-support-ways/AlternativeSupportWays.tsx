import './AlternativeSupportWays.scss';
import {
    ALTERNATIVE_SUPPORT_WAYS_LABEL,
    DOWNLOAD_PAYMENT_DETAILS_BUTTON_LABEL,
    MONOBANK_JAR_LABEL,
    MONOBANK_JAR_LINK_LABEL,
    PAY_PAL_EMAIL_LABEL,
    PAY_PAL_LABEL,
} from '../../../../const/donate-page/donate-page';
import { CopyTextButton } from '../../copy-text-button/CopyTextButton';
import ArrowUpRight from '../../../../assets/icons/arrow-up-right.svg';
import ShareForwardArrow from '../../../../assets/icons/share-forward-arrow.svg';
import React from 'react';

export const AlternativeSupportWays = () => {
    return (
        <div className="alternativeSupportWays">
            <h2>{ALTERNATIVE_SUPPORT_WAYS_LABEL}</h2>
            <div className="labelContainer">
                <h3>{PAY_PAL_LABEL}</h3>
                <div className="labelWithCopyButton">
                    <span className="label">{PAY_PAL_EMAIL_LABEL}</span>
                    <CopyTextButton textToCopy={PAY_PAL_EMAIL_LABEL} />
                </div>
            </div>
            <div className="labelContainer">
                <h3>{MONOBANK_JAR_LABEL}</h3>
                <div className="labelWithCopyButton">
                    <a className="label" href={MONOBANK_JAR_LINK_LABEL}>
                        {MONOBANK_JAR_LINK_LABEL}
                    </a>
                    <CopyTextButton textToCopy={MONOBANK_JAR_LINK_LABEL} />
                </div>
            </div>
            <div className="buttonsContainer">
                <button className="downloadPaymentDetailsButton">
                    {DOWNLOAD_PAYMENT_DETAILS_BUTTON_LABEL}
                    <img src={ArrowUpRight} alt="arrow-up-right" />
                </button>
                <button className="shareButton">
                    <img src={ShareForwardArrow} alt="share-forward-arrow" />
                </button>
            </div>
        </div>
    );
};
