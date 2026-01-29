import { Select } from '@/components/common/select/Select';
import { Button } from '@/components/admin/button/Button';
import { COMMON_TEXT_ADMIN, LANGUAGES } from '@/const/admin/common';
import styles from './TranslationControls.module.scss';

interface TranslationControlsProps {
    isSubmitting: boolean;
    onGenerate?: () => void;
}

export const TranslationControls = ({ isSubmitting, onGenerate }: TranslationControlsProps) => {
    return (
        <div className={styles.container}>
            <div className={styles['language-select']}>
                <Select<string>
                    className="language-select"
                    headClassName={styles['language-select-head']}
                    value="EN"
                    onValueChange={() => {}}
                >
                    <Select.Option value="EN" name={LANGUAGES.EN} />
                </Select>
            </div>

            <Button
                className={styles['generate-button']}
                buttonStyle="primary"
                disabled={isSubmitting}
                onClick={onGenerate}
                type="button"
            >
                {COMMON_TEXT_ADMIN.BUTTON.GENERATE_TRANSLATION}
            </Button>
        </div>
    );
};
