import { useForm, Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCreateMemberSchema } from '../../validation/admin-create-member-form/create-member-schema';
import { FullMemberFormValues, DraftMemberFormValues } from '../../pages/admin/team/components/member-form/MemberForm';

export const useCreateMemberForm = (isDraft: boolean) => {
    
    type FormValues = typeof isDraft extends true ? DraftMemberFormValues : FullMemberFormValues;

    return useForm<FormValues>({
        resolver: yupResolver(useCreateMemberSchema(isDraft)) as Resolver<FormValues>,
        mode: 'onBlur',
    });
};
