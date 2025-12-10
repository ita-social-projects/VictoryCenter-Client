import './CopyTextButton.scss';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReactComponent as CheckMark } from '@/assets/icons/checkmark.svg';
import { ReactComponent as Copy } from '@/assets/icons/copy.svg';

interface CopyTextButtonProps {
    textToCopy: string;
}

export const CopyTextButton = ({ textToCopy }: CopyTextButtonProps) => {
    const { t } = useTranslation('global');
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(textToCopy);
        setCopied(true);
    };

    return (
        <button
            className={`copyTextButton ${copied ? 'copied' : ''}`}
            onClick={handleCopy}
            onAnimationEnd={() => setCopied(false)}
        >
            {copied ? (
                <>
                    <CheckMark />
                    <span className="copyMessage">{t('COPIED_GLOBAL_MESSAGE')}</span>
                </>
            ) : (
                <Copy />
            )}
        </button>
    );
};
