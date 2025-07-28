import React from 'react';
import { CopyTextButton } from '../../copy-text-button/CopyTextButton';

export const PaymentLabelWithCopy = ({
    label,
    value,
    copyValue,
}: {
    label: React.ReactNode;
    value: React.ReactNode;
    copyValue: string;
}) => (
    <div className="paymentLabel">
        <h3>{label}</h3>
        <div className="labelWithCopyButton">
            <span className="label">{value}</span>
            <CopyTextButton textToCopy={copyValue} />
        </div>
    </div>
);
