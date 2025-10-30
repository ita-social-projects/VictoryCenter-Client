export interface UseTeamMemberFormProps<TFormData, TErrorState> {
    defaultFormState: TFormData;
    initialData: TFormData;
    validateForm: (formState: TFormData, isPublishing: boolean) => TErrorState;
    
}