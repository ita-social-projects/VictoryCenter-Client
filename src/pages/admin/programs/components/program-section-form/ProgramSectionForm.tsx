import { Button } from '@/components/admin/button/Button';
import { ProgramSection } from '@/types/admin/programs';
import { PROGRAMS_TEXT } from '@/const/admin/programs';
import styles from './ProgramSectionForm.module.scss';

export interface ProgramSectionFormProps {
    section: ProgramSection;
    onSave: () => void;
    onCancel: () => void;
    isDisabled?: boolean;
}

export const ProgramSectionForm = ({ section, onSave, onCancel, isDisabled = false }: ProgramSectionFormProps) => {
    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <p className={styles['template-info']}>
                    Template ID: <strong>{section.template}</strong>
                </p>
                {/* Empty space for future template-specific inputs */}
            </div>
            <div className={styles.actions}>
                <Button buttonStyle="secondary" onClick={onCancel} disabled={isDisabled}>
                    {PROGRAMS_TEXT.BUTTON.CANCEL}
                </Button>
                <Button buttonStyle="primary" onClick={onSave} disabled={true}>
                    {PROGRAMS_TEXT.BUTTON.SAVE}
                </Button>
            </div>
        </div>
    );
};
