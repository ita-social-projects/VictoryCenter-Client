import cn from 'classnames';
import styles from './LanguageSwitcherButtons.module.scss';

interface LanguageSwitcherButtonsProps {
    className?: string;
    currentLanguage: 'uk' | 'en';
    onLanguageChange: (lang: 'uk' | 'en') => void;
}

const LANGUAGE_LABELS: Record<string, string> = {
    uk: 'UA',
    en: 'EN',
};

export const LanguageSwitcherButtons = ({
    className,
    currentLanguage,
    onLanguageChange,
}: LanguageSwitcherButtonsProps) => {
    return (
        <div className={cn(styles.root, className)}>
            {Object.keys(LANGUAGE_LABELS).map((lang) => (
                <button
                    key={lang}
                    className={cn(styles.button, currentLanguage === lang && styles.active)}
                    onClick={() => onLanguageChange(lang as 'uk' | 'en')}
                >
                    {LANGUAGE_LABELS[lang]}
                </button>
            ))}
        </div>
    );
};
