import { CopyTextButton } from '../../copy-text-button/CopyTextButton';
import React from 'react';

export const CorrespondentBankBlock = ({
    title,
    fields,
}: {
    title: string;
    fields: { label: string; value: string }[];
}) => (
    <div className="paymentLabel">
        <h3>{title}</h3>
        <div className="labelsContainers">
            {fields.map((f) => (
                <div className="labelsContainer" key={`${f.label}-${f.value}`}>
                    <div className="labelWithCopyButton">
                        <span className="highlightedLabel">{f.label}</span>
                        <span className="label">{f.value}</span>
                        <CopyTextButton textToCopy={f.value} />
                    </div>
                </div>
            ))}
        </div>
    </div>
);
