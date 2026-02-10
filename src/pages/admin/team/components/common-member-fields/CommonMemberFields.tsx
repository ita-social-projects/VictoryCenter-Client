import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { TEAM_MEMBERS_TEXT, TEAM_MEMBER_VALIDATION } from '@/const/admin/team';
import styles from './CommonMemberFields.module.scss';
import './CommonMemberFields.scss';
import cn from 'classnames';

interface CommonMemberFieldsProps<TFormData extends CommonFields, TErrorState extends CommonErrors> {
    formState: TFormData;
    errors: TErrorState;
    isSubmitting: boolean;
    formDisabled: boolean | undefined;
    handleFullNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleFullNameBlur: () => void;
    handleDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    handleDescriptionBlur: () => void;
}

export type CommonFields = {
    fullName: string;
    description: string;
};

export type CommonErrors = {
    fullName?: string[];
    description?: string;
    [key: string]: string | string[] | undefined;
};

export const CommonMemberFields = <TFormData extends CommonFields, TErrorState extends CommonErrors>({
    formState,
    errors,
    isSubmitting,
    formDisabled,
    handleFullNameChange,
    handleFullNameBlur,
    handleDescriptionChange,
    handleDescriptionBlur,
}: CommonMemberFieldsProps<TFormData, TErrorState>) => {
    return (
        <div className={cn(styles.root, 'common-member-fields')}>
            <div className={styles['form-group']}>
                <InputWithCharacterLimitGroup
                    label={TEAM_MEMBERS_TEXT.FORM.LABEL.FULLNAME}
                    isRequired
                    value={formState.fullName}
                    onChange={handleFullNameChange}
                    onBlur={handleFullNameBlur}
                    id="fullName"
                    name="fullName"
                    maxLength={TEAM_MEMBER_VALIDATION.fullName.max}
                    disabled={isSubmitting || formDisabled}
                    error={errors.fullName && Array.isArray(errors.fullName) ? errors.fullName[0] : undefined}
                    maxLimitWarning={TEAM_MEMBER_VALIDATION.fullName.getMaxError()}
                />
            </div>

            <div className={styles['form-group']}>
                <TextAreaWithCharacterLimitGroup
                    label={TEAM_MEMBERS_TEXT.FORM.LABEL.DESCRIPTION}
                    isRequired
                    id="description"
                    name="description"
                    value={formState.description}
                    onChange={handleDescriptionChange}
                    onBlur={handleDescriptionBlur}
                    rows={8}
                    disabled={isSubmitting || formDisabled}
                    maxLength={TEAM_MEMBER_VALIDATION.description.max}
                    error={errors.description}
                    maxLimitWarning={TEAM_MEMBER_VALIDATION.description.getMaxError()}
                />
            </div>
        </div>
    );
};
