import cn from 'classnames';
import styles from './LanguageSwitcherButtons.module.scss';
import { useState } from 'react';

interface LanguageSwitcherButtonsProps {
    className?: string;
}

const LANGUAGE_LABELS: Record<string, string> = {
    uk: 'UA',
    en: 'EN',
};

export const LanguageSwitcherButtons = ({ className }: LanguageSwitcherButtonsProps) => {
    const [currentLanguage, setCurrentLanguage] = useState<'uk' | 'en'>('uk');
    const handleClick = (lang: 'uk' | 'en') => {
        setCurrentLanguage(lang);
    };

    return (
        <div className={cn(styles.root, className)}>
            {Object.keys(LANGUAGE_LABELS).map((lang) => (
                <button
                    key={lang}
                    className={cn(styles.button, currentLanguage === lang && styles.active)}
                    onClick={() => handleClick(lang as 'uk' | 'en')}
                >
                    {LANGUAGE_LABELS[lang]}
                </button>
            ))}
        </div>
    );
};
