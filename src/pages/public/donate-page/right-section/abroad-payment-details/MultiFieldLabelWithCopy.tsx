import React from 'react';
import { CopyTextButton } from '../../copy-text-button/CopyTextButton';

interface MultiFieldLabelWithCopyProps {
    label: React.ReactNode;
    values: string[];
    copyValue: string;
    stylesModule: Record<string, string>;
}

export const MultiFieldLabelWithCopy = ({ label, values, copyValue, stylesModule }: MultiFieldLabelWithCopyProps) => (
    <div className={stylesModule['paymentLabel']}>
        <h3>{label}</h3>
        <div className={stylesModule['labelWithCopyButton']}>
            <div>
                {values.map((v, index) => (
                    <p className={stylesModule['label']} key={`${v}-${index}`}>
                        {v}
                    </p>
                ))}
            </div>
            <CopyTextButton textToCopy={copyValue} />
        </div>
    </div>
);
