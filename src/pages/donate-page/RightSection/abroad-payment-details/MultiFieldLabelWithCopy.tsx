import React from 'react';
import { CopyTextButton } from '../../copy-text-button/CopyTextButton';

export const MultiFieldLabelWithCopy = ({
    label,
    values,
    copyValue,
}: {
    label: React.ReactNode;
    values: string[];
    copyValue: string;
}) => (
    <div className="paymentLabel">
        <h3>{label}</h3>
        <div className="labelWithCopyButton">
            <div>
                {values.map((v, index) => (
                    <p className="label" key={`${v}-${index}`}>
                        {v}
                    </p>
                ))}
            </div>
            <CopyTextButton textToCopy={copyValue} />
        </div>
    </div>
);
