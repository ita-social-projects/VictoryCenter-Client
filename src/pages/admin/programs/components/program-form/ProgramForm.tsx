import React, {useEffect, useState, forwardRef, useImperativeHandle, useRef} from 'react';
import { useForm, Controller, Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { programValidationSchema, ProgramValidationContext } from '../../../../../validation/admin/program-schema/program-scheme';
import { PROGRAMS_TEXT } from '../../../../../const/admin/programs';
import { PROGRAM_VALIDATION } from '../../../../../const/admin/programs';
import { ProgramCategory } from '../../../../../types/ProgramAdminPage';
import { VisibilityStatus } from '../../../../../types/Common';
import ProgramsApi from '../../../../../services/api/admin/programs/programs-api';
import MultiSelect from '../../../../../components/common/multi-select/MultiSelect';
import PhotoInput from '../../../../../components/common/photo-input/PhotoInput';
import InputWithCharacterLimit from '../../../../../components/common/input-with-character-limit/InputWithCharacterLimit';
import TextAreaWithCharacterLimit from '../../../../../components/common/textarea-with-character-limit/TextAreaWithCharacterLimit';
import './program-form.scss';

export type ProgramFormValues = {
    name: string;
    categories: ProgramCategory[];
    description: string;
    img: File | string | null;
};

export interface ProgramFormRef {
    submit: (status: VisibilityStatus) => void;
    isDirty: boolean;
}

export interface ProgramFormProps {
    onSubmit: (data: ProgramFormValues, status: VisibilityStatus) => Promise<void>;
    initialData?: ProgramFormValues | null;
    formDisabled?: boolean;
}

export const ProgramForm = forwardRef<ProgramFormRef, ProgramFormProps>(
    ({ initialData = null, onSubmit, formDisabled }: ProgramFormProps, ref) => {
        const [availableCategories, setAvailableCategories] = useState<ProgramCategory[]>([]);
        const [validationContext, setValidationContext] = useState<ProgramValidationContext>({
            isPublishing: false,
        });
        const statusRef = useRef<VisibilityStatus | null>(null);

        const {
            control,
            handleSubmit,
            formState: { errors, isSubmitting, isDirty },
            trigger,
            reset,
        } = useForm<ProgramFormValues>({
            context: validationContext,
            resolver: yupResolver(programValidationSchema) as Resolver<ProgramFormValues>,
            mode: 'onBlur',
            defaultValues: {
                name: '',
                categories: [],
                description: '',
                img: null,
            },
        });

        useEffect(() => {
            if (statusRef.current) {
                try {
                    handleSubmit((data) => onSubmit(data, statusRef.current!))();
                }
                finally {
                    statusRef.current = null;
                }
            }
        }, [validationContext, handleSubmit, onSubmit]);

        useEffect(() => {
            if (initialData) {
                reset(initialData);
            } else {
                reset({ name: '', description: '', categories: [], img: null });
            }
        }, [initialData, reset]);

        useEffect(() => {
            const fetchCategories = async () => {
                try {
                    const categories = await ProgramsApi.fetchProgramCategories();
                    setAvailableCategories(categories);
                } catch (error) {
                    console.error('Error fetching categories:', error);
                }
            };
            fetchCategories();
        }, []);

        const submit = (status: VisibilityStatus) => {
            const isPublishing = status === 'Published';
            statusRef.current = status;
            setValidationContext({ isPublishing });
        };

        useImperativeHandle(ref, () => ({
            submit,
            isDirty,
        }));

        return (
            <form className="program-form-main" data-testid="test-form" noValidate>
                {/* Categories Field */}
                <div className="form-group">
                    <label>
                        <span className="required-field">*</span>
                        Категорії
                    </label>
                    <Controller
                        name="categories"
                        control={control}
                        render={({ field }) => (
                            <MultiSelect
                                {...field}
                                options={availableCategories}
                                disabled={isSubmitting || formDisabled}
                                placeholder={PROGRAMS_TEXT.FORM.LABEL.SELECT_CATEGORY}
                                getOptionId={(cat: ProgramCategory) => cat.id}
                                getOptionName={(cat: ProgramCategory) => cat.name}
                            />
                        )}
                    />
                    {errors.categories && <span className="error">{errors.categories.message}</span>}
                </div>
                {/* Name Field */}
                <div className="form-group">
                    <label htmlFor="name">
                        <span className="required-field">*</span>
                        {PROGRAMS_TEXT.FORM.LABEL.NAME}
                    </label>
                    <Controller
                        name={'name'}
                        control={control}
                        render={({ field }) => (
                            <InputWithCharacterLimit
                                {...field}
                                id="name"
                                maxLength={PROGRAM_VALIDATION.name.max}
                                disabled={isSubmitting || formDisabled}
                            />
                        )}
                    />
                    {errors.name && <span className="error">{errors.name.message}</span>}
                </div>
                {/* Description Field */}
                <div className="form-group">
                    <label htmlFor="description">
                        <span className="required-field">*</span>
                        {PROGRAMS_TEXT.FORM.LABEL.DESCRIPTION}
                    </label>
                    <Controller
                        control={control}
                        name={'description'}
                        render={({ field }) => (
                            <TextAreaWithCharacterLimit
                                {...field}
                                name="description"
                                id="description"
                                rows={8}
                                disabled={isSubmitting || formDisabled}
                                maxLength={PROGRAM_VALIDATION.description.max}
                            />
                        )}
                    />
                    {errors.description && <span className="error">{errors.description.message}</span>}
                </div>
                {/* Image Field */}
                <div className="form-group form-group-image">
                    <span>
                        <span className="required-field">*</span>
                        {PROGRAMS_TEXT.FORM.LABEL.PHOTO}
                    </span>
                    <Controller
                        name={'img'}
                        control={control}
                        render={({ field }) => (
                            <PhotoInput
                                {...field}
                                id="img"
                                disabled={isSubmitting || formDisabled}
                                onChange={(value) => {
                                    // OnBlur event is not triggered in file input, that's why onChange event overridden
                                    field.onChange(value);
                                    console.log(value);
                                    trigger('img');
                                }}
                            />
                        )}
                    />
                    {errors.img && <span className="error">{errors.img.message}</span>}
                </div>
            </form>
        );
    },
);
