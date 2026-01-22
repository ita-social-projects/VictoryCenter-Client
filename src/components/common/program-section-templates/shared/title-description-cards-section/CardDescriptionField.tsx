import { InputLabel } from '@/components/admin/input-label/InputLabel';
import { InputErrorWithCharacterCounter } from '@/components/admin/input-error-with-character-counter/InputErrorWithCharacterCounter';
import { TextAreaWithBulletBehavior } from '@/components/admin/textarea-with-bullets/TextAreaWithBulletBehavior';
import styles from './TitleDescriptionCardsSection.module.scss';

interface CardDescriptionFieldProps {
    label: string;
    id: string;
    name: string;
    value: string;
    isRequired?: boolean;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
    onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
    maxLength: number;
    disabled?: boolean;
    placeholder?: string;
    rows?: number;
    error?: string | undefined;
    currentLength?: number;
}

export const CardDescriptionField = ({
    label,
    id,
    name,
    value,
    isRequired,
    onChange,
    onBlur,
    onFocus,
    maxLength,
    disabled,
    placeholder,
    rows,
    error,
    currentLength,
}: CardDescriptionFieldProps) => {
    const counterId = `${id}-character-count`;
    const resolvedCurrent = currentLength ?? value.length;

    return (
        <div className={styles['input-group']}>
            <InputLabel htmlFor={id} text={label} isRequired={isRequired} />

            <TextAreaWithBulletBehavior
                id={id}
                name={name}
                value={value}
                onChange={onChange}
                onBlur={onBlur}
                onFocus={onFocus}
                maxLength={maxLength}
                disabled={disabled}
                placeholder={placeholder}
                rows={rows}
            />

            <InputErrorWithCharacterCounter
                error={error}
                currentLength={resolvedCurrent}
                maxLength={maxLength}
                counterId={counterId}
                htmlFor={id}
            />
        </div>
    );
};

export default CardDescriptionField;
