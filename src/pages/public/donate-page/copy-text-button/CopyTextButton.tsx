import './CopyTextButton.scss';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as CheckMark } from '../../../../assets/icons/checkmark.svg';
import { ReactComponent as Copy } from '../../../../assets/icons/copy.svg';

interface CopyTextButtonProps {
    textToCopy: string;
}

export const CopyTextButton = ({ textToCopy }: CopyTextButtonProps) => {
    const { t } = useTranslation('donatePage');
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
    };

    return (
        <div
            role="button"
            className={`copyTextButton ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
            data-message={t('COPIED_MESSAGE')}
            onAnimationEnd={() => setCopied(false)}
        >
            {copied ? <CheckMark className="checkmark-icon" /> : <Copy className="checkmark-icon" />}
        </div>
    );
};
