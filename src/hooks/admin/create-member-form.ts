import { useForm, Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCreateMemberSchema } from '../../validation/admin-create-member-form/create-member-schema';
import { MemberFormValues } from '../../pages/admin/team/components/member-form/MemberForm';

export const useCreateMemberForm = () =>
    useForm<MemberFormValues>({
        resolver: yupResolver(useCreateMemberSchema) as unknown as Resolver<MemberFormValues, any, MemberFormValues>,
        mode: 'onBlur'
    });
