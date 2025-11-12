import { InputLabel } from '../../../../../../components/admin/input-label/InputLabel';
import { InputWithCharacterLimit } from '../../../../../../components/admin/input-with-character-limit/InputWithCharacterLimit';
import { TextAreaWithCharacterLimit } from '../../../../../../components/admin/textarea-with-character-limit/TextAreaWithCharacterLimit';
import { TEAM_MEMBER_VALIDATION, TEAM_MEMBERS_TEXT } from '../../../../../../const/admin/team';
import { CommonErrors, CommonFields } from '../use-team-member-form/useTeamMemberForm';
import './CommonMemberFields.scss';

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
        <>
            <div className="form-group">
                <InputLabel htmlFor={'fullName'} text={TEAM_MEMBERS_TEXT.FORM.LABEL.FULLNAME} isRequired />
                <InputWithCharacterLimit
                    value={formState.fullName}
                    onChange={handleFullNameChange}
                    onBlur={handleFullNameBlur}
                    id="fullName"
                    name="fullName"
                    maxLength={TEAM_MEMBER_VALIDATION.fullName.max}
                    disabled={isSubmitting || formDisabled}
                />
                {errors.fullName && <p className="error">{errors.fullName}</p>}
            </div>
            <div className="form-group">
                <InputLabel htmlFor={'description'} text={TEAM_MEMBERS_TEXT.FORM.LABEL.DESCRIPTION} />
                <TextAreaWithCharacterLimit
                    value={formState.description}
                    onChange={handleDescriptionChange}
                    onBlur={handleDescriptionBlur}
                    id="description"
                    name="description"
                    rows={8}
                    disabled={isSubmitting || formDisabled}
                    maxLength={TEAM_MEMBER_VALIDATION.description.max}
                />
                {errors.description && <span className="error desc-error">{errors.description}</span>}
            </div>
        </>
    );
};
