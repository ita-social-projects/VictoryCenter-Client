import { Select } from '@/components/common/select/Select';
import { Button } from '@/components/admin/button/Button';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { LocalizationLanguage } from '@/types/common/language';
import styles from './TranslationControls.module.scss';
import cn from 'classnames';

interface TranslationControlsProps {
    isSubmitting: boolean;
    languages: LocalizationLanguage[];
    selectedLanguage: LocalizationLanguage | null;
    onLanguageChange: (language: LocalizationLanguage) => void;
    onGenerate?: () => void;
}

export const TranslationControls = ({
    languages,
    selectedLanguage,
    onLanguageChange,
    onGenerate,
}: TranslationControlsProps) => {
    return (
        <div className={styles.container}>
            <div className={styles['language-select']}>
                {selectedLanguage && (
                    <Select<string>
                        className="language-select"
                        headClassName={styles['language-select-head']}
                        value={selectedLanguage.code}
                        onValueChange={(code) => {
                            const newLang = languages.find((l) => l.code === code);
                            if (newLang) onLanguageChange(newLang);
                        }}
                        placeholder={'Англійська'}
                    >
                        {languages.map((lang) => (
                            <Select.Option key={lang.id} value={lang.code} name={lang.name} />
                        ))}
                    </Select>
                )}
            </div>
            <Button
                className={cn(styles['generate-button'], styles.disable)}
                buttonStyle="primary"
                disabled={true}
                onClick={onGenerate}
                type="button"
            >
                {COMMON_TEXT_ADMIN.BUTTON.GENERATE_TRANSLATION}
            </Button>
        </div>
    );
};
