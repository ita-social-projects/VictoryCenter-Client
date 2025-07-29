import { ChangeEvent, useEffect, useState } from 'react';
import { TeamCategory } from '../../../../../types/admin/TeamMembers';
import { useCreateMemberForm } from '../../../../../hooks/admin/create-member-form';
import '../members-list/members-list.scss';
import { MAX_FULLNAME_LENGTH, MAX_DESCRIPTION_LENGTH } from '../../../../../const/admin/data-validation';
import {
    TEAM_LABEL_CATEGORY,
    TEAM_LABEL_SELECT_CATEGORY,
    TEAM_LABEL_FULLNAME,
    TEAM_LABEL_DESCRIPTION,
} from '../../../../../const/team';
import { ImageValues } from '../../../../../types/Image';
import PhotoInput from '../../../../../components/common/photo-input/PhotoInput';
import { useAdminClient } from '../../../../../utils/hooks/use-admin-client/useAdminClient';
import { TeamCategoriesApi } from '../../../../../services/data-fetch/admin-page-data-fetch/team-page-data-fetch/TeamCategoriesApi/TeamCategoriesApi';
import ArrowUp from '../../../../../assets/icons/chevron-up.svg';
import ArrowDown from '../../../../../assets/icons/chevron-down.svg';

export type PublishMemberFormValues = {
    category: TeamCategory;
    fullName: string;
    description: string;
    image: ImageValues | null;
    imageId: number | null;
};

export type DraftMemberFormValues = {
    category: TeamCategory;
    fullName: string;
    description: string;
    image: ImageValues | null;
    imageId: number | null;
};

export type MemberFormValues = PublishMemberFormValues | DraftMemberFormValues;

export type MemberFormProps = {
    id: string;
    onSubmit: (memberFormValues: MemberFormValues) => void;
    onDraftSubmit?: (data: MemberFormValues) => void;
    existingMemberFormValues?: MemberFormValues | null;
    onValuesChange?: (memberFormValues: MemberFormValues) => void;
    onError?: (msg: string | null) => void;
    isDraft: boolean;
};

export const MemberForm = ({
    onSubmit,
    onDraftSubmit,
    id,
    existingMemberFormValues = null,
    onValuesChange,
    onError,
    isDraft,
}: MemberFormProps) => {
    const client = useAdminClient();
    const [categories, setCategories] = useState<TeamCategory[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [isInitialized, setIsInitialized] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [memberFormValues, setMemberFormValues] = useState<MemberFormValues>(
        existingMemberFormValues || {
            fullName: '',
            image: null,
            imageId: null,
            description: '',
            category: {} as TeamCategory,
        },
    );

    const handleOpenSelect = () => {
        setIsOpen(!isOpen);
    };

    const {
        register,
        watch,
        handleSubmit,
        setValue,
        reset,
        formState: { errors },
    } = useCreateMemberForm(isDraft);

    const {
        ref: categoryRef,
        onBlur: categoryOnBlur,
        onChange: categoryOnChange,
        name: categoryName,
    } = register('category');

    const watchedImg = watch('image');

    const handleOnSubmit = (data: MemberFormValues) => {
        if (isDraft) {
            onDraftSubmit?.(data);
        } else {
            onSubmit(data);
        }
    };

    const handleMemberFormValuesChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;
        const inputTarget = e.currentTarget as EventTarget & HTMLInputElement;
        if (name === 'category') {
            let selected: TeamCategory | undefined = categories.find((c) => c.name === value);
            setMemberFormValues((prev) => ({
                ...prev,
                category: selected as TeamCategory,
            }));
            return;
        }
        if (inputTarget.files && inputTarget.files.length > 0) {
            const file = inputTarget.files;
            setMemberFormValues((prev) => ({
                ...prev,
                img: file,
            }));
            return;
        }

        setMemberFormValues((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const onFileChange = (item: ImageValues | null) => {
        setMemberFormValues((prev) => ({
            ...prev,
            image: item,
        }));
        setValue('image', item, { shouldValidate: true });
    };

    useEffect(() => {
        if (existingMemberFormValues && !isInitialized) {
            reset({
                ...existingMemberFormValues,
                image: existingMemberFormValues.image || null,
            });
            setIsInitialized(true);
        }
    }, [existingMemberFormValues, isInitialized, reset]);

    useEffect(() => {
        const subscription = watch((value) => {
            if (onValuesChange) {
                onValuesChange(value as MemberFormValues);
            }
        });
        return () => subscription.unsubscribe();
    }, [watch, onValuesChange]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await TeamCategoriesApi.getAll(client);
                setCategories(data);
            } catch (error) {
                onError?.((error as Error).message);
            } finally {
                setIsLoadingCategories(false);
            }
        };
        fetchCategories();
    }, [client, onError]);

    // const handleFileDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    //     e.preventDefault();

    //     const files = e.dataTransfer.files;
    //     if (files && files.length > 0) {
    //         setValue('image', files, { shouldValidate: true });
    //     }
    // };

    return (
        <form id={id} onSubmit={handleSubmit(handleOnSubmit)} data-testid="test-form">
            <div className="members-add-modal-body">
                <div className="form-group">
                    <label htmlFor="category" className="no-pointer-events">
                        <span className="field-required">*</span>
                        {TEAM_LABEL_CATEGORY}
                    </label>
                    <select
                        value={memberFormValues?.category?.name ?? ''}
                        onChange={handleMemberFormValuesChange}
                        id="category"
                        disabled={isLoadingCategories}
                        name={categoryName}
                        ref={categoryRef}
                        className="custom-select default-select"
                        onClick={handleOpenSelect}
                        onBlur={async (e) => {
                            setIsOpen(false);
                            await categoryOnBlur(e);
                        }}
                    >
                        <option value="" disabled className="option-value">
                            {TEAM_LABEL_SELECT_CATEGORY}
                        </option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.name}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    <img src={isOpen ? ArrowUp : ArrowDown} className="icon-img" alt="arrow-down" />
                    {errors.category && <p className="error">{errors.category.message}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="fullName">
                        <span className="field-required">*</span>
                        {TEAM_LABEL_FULLNAME}
                    </label>
                    <input maxLength={MAX_FULLNAME_LENGTH} type="text" id="fullName" {...register('fullName')} />
                    <div className="form-group-fullname-length-limit">
                        {watch('fullName')?.length || 0}/{MAX_FULLNAME_LENGTH}
                    </div>
                    {errors.fullName && <p className="error">{errors.fullName.message}</p>}
                </div>

                <div className="form-group">
                    <label htmlFor="description">{TEAM_LABEL_DESCRIPTION}</label>
                    <textarea
                        maxLength={MAX_DESCRIPTION_LENGTH}
                        className="form-group-description"
                        id="description"
                        {...register('description')}
                    />
                    {errors.description && <p className="error">{errors.description.message}</p>}
                    <div className="form-group-description-length-limit">
                        {watch('description')?.length || 0}/{MAX_DESCRIPTION_LENGTH}
                    </div>
                </div>
                <PhotoInput value={memberFormValues?.image ?? null} onChange={onFileChange} id="photo" />
            </div>
        </form>
    );
};
