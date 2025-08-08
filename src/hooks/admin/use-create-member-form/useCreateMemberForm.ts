import { useForm, Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCreateMemberSchema } from '../../../validation/admin/create-member-schema/create-member-schema';
import {
    PublishMemberFormValues,
    DraftMemberFormValues,
} from '../../../pages/admin/team/components/member-form/MemberForm';

export const useCreateMemberForm = (isDraft: boolean) => {
    type FormValues = typeof isDraft extends true ? DraftMemberFormValues : PublishMemberFormValues;

    return useForm<FormValues>({
        resolver: yupResolver(useCreateMemberSchema(isDraft)) as Resolver<FormValues>,
        mode: 'onChange',
    });
};
