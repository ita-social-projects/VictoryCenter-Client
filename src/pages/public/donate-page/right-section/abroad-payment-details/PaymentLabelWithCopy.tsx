import React from 'react';
import { CopyTextButton } from '../../copy-text-button/CopyTextButton';

interface PaymentLabelWithCopyProps {
    label: React.ReactNode;
    value: React.ReactNode;
    copyValue: string;
    stylesModule: Record<string, string>;
}

export const PaymentLabelWithCopy = ({ label, value, copyValue, stylesModule }: PaymentLabelWithCopyProps) => (
    <div className={stylesModule['paymentLabel']}>
        <h3>{label}</h3>
        <div className={stylesModule['labelWithCopyButton']}>
            <span className={stylesModule['label']}>{value}</span>
            <CopyTextButton textToCopy={copyValue} />
        </div>
    </div>
);
