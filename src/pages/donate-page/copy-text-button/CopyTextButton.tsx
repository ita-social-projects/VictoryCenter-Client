import './CopyTextButton.scss';
import React from 'react';
import { ReactComponent as CopyIcon } from '../../../assets/icons/copy.svg';

interface CopyTextButtonProps {
    textToCopy: string;
}

export const CopyTextButton: React.FC<CopyTextButtonProps> = ({ textToCopy }) => {
    const handleCopy = async () => {
        await navigator.clipboard.writeText(textToCopy);
    };

    return <CopyIcon className="copyTextButton" onClick={handleCopy} />;
};
