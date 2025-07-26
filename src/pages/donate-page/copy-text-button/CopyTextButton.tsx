import './CopyTextButton.scss';
import React from 'react';

interface CopyTextButtonProps {
    textToCopy: string;
}

export const CopyTextButton = ({ textToCopy }: CopyTextButtonProps) => {
    const handleCopy = async () => {
        await navigator.clipboard.writeText(textToCopy);
        alert('Copied!');
    };

    return <button className="copyTextButton" onClick={handleCopy}></button>;
};
