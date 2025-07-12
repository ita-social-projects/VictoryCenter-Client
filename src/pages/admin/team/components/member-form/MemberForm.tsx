import CloudDownload from '../../../../../assets/icons/cloud-download.svg';
import React, { useEffect, useState } from 'react';
import { useCreateMemberForm } from '../../../../../hooks/admin/create-member-form';
import '../members-list/members-list.scss';
import { MAX_FULLNAME_LENGTH, MAX_DESCRIPTION_LENGTH } from '../../../../../const/admin/data-validation';
import { TeamCategory } from '../../TeamPage';
import {
    TEAM_CATEGORY_MAIN,
    TEAM_CATEGORY_SUPERVISORY,
    TEAM_CATEGORY_ADVISORS,
    TEAM_LABEL_CATEGORY,
    TEAM_LABEL_SELECT_CATEGORY,
    TEAM_LABEL_FULLNAME,
    TEAM_LABEL_DESCRIPTION,
    TEAM_LABEL_PHOTO,
    TEAM_LABEL_DRAG_DROP,
} from '../../../../../const/team';
import ArrowUp from '../../../../../assets/icons/chevron-up.svg';
import ArrowDown from '../../../../../assets/icons/chevron-down.svg';

export type PublishMemberFormValues = {
    category: TeamCategory;
    fullName: string;
    description: string;
    img: FileList | string;
};

export type DraftMemberFormValues = {
    category: TeamCategory;
    fullName: string;
    description?: string;
    img?: FileList | string;
};

export type MemberFormValues = PublishMemberFormValues | DraftMemberFormValues;

export type MemberFormProps = {
    id: string;
    onSubmit: (memberFormValues: MemberFormValues) => void;
    onDraftSubmit?: (data: MemberFormValues) => void;
    existingMemberFormValues?: MemberFormValues | null;
    onValuesChange?: (memberFormValues: MemberFormValues) => void;
    isDraft: boolean;
    previewImgUrl?: string;
};

export const MemberForm = ({
    onSubmit,
    onDraftSubmit,
    id,
    existingMemberFormValues = null,
    onValuesChange,
    isDraft,
    previewImgUrl,
}: MemberFormProps) => {
    const [isInitialized, setIsInitialized] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const handleOpenSelect = () => {
        setIsOpen(!isOpen);
    };

    const {
        register,
        watch,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useCreateMemberForm(isDraft);

    const {
        ref: categoryRef,
        onBlur: categoryOnBlur,
        onChange: categoryOnChange,
        name: categoryName,
    } = register('category');

    const watchedImg = watch('img');

    const handleOnSubmit = (data: MemberFormValues) => {
        if (isDraft && onDraftSubmit) {
            onDraftSubmit(data);
        } else {
            onSubmit(data);
        }
    };

    useEffect(() => {
        if (existingMemberFormValues && !isInitialized) {
            reset({
                ...existingMemberFormValues,
                img: existingMemberFormValues.img || '',
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

    const handleFileDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            setValue('img', files, { shouldValidate: true });
        }
    };

    return (
        <form id={id} onSubmit={handleSubmit(handleOnSubmit)} data-testid="test-form">
            <div className="members-add-modal-body">
                <div className="form-group">
                    <label htmlFor="category" className="no-pointer-events">
                        <span className="field-required">*</span>
                        {TEAM_LABEL_CATEGORY}
                    </label>
                    <select
                        id="category"
                        name={categoryName}
                        ref={categoryRef}
                        defaultValue={existingMemberFormValues?.category || ''}
                        className="custom-select default-select"
                        onClick={handleOpenSelect}
                        onBlur={async (e) => {
                            setIsOpen(false);
                            await categoryOnBlur(e);
                        }}
                        onChange={categoryOnChange}
                    >
                        <option value="" disabled className="option-value">
                            {TEAM_LABEL_SELECT_CATEGORY}
                        </option>
                        <option value={TEAM_CATEGORY_MAIN} className="option-value">
                            {TEAM_CATEGORY_MAIN}
                        </option>
                        <option value={TEAM_CATEGORY_SUPERVISORY} className="option-value">
                            {TEAM_CATEGORY_SUPERVISORY}
                        </option>
                        <option value={TEAM_CATEGORY_ADVISORS} className="option-value">
                            {TEAM_CATEGORY_ADVISORS}
                        </option>
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

                <div className="form-group form-group-image">
                    <span>{TEAM_LABEL_PHOTO}</span>
                    <div className="form-group-image-details">
                        <label
                            onDragOver={(e) => e.preventDefault()}
                            onDragLeave={(e) => e.preventDefault()}
                            onDrop={handleFileDrop}
                            htmlFor="image"
                            className="form-group-image-choose-file"
                        >
                            {watchedImg instanceof FileList && watchedImg.length > 0 ? (
                                <img
                                    src={URL.createObjectURL(watchedImg[0])}
                                    alt="uploaded"
                                    className="form-group-image-choose-file-inner solid-border"
                                />
                            ) : previewImgUrl ? (
                                <img
                                    src={previewImgUrl}
                                    alt="preview"
                                    className="form-group-image-choose-file-inner solid-border"
                                />
                            ) : (
                                <div
                                    className="form-group-image-choose-file-inner dashed-border"
                                    data-testid="drop-area"
                                >
                                    <img src={CloudDownload} alt="cloud-download" />
                                    <span>{TEAM_LABEL_DRAG_DROP}</span>
                                </div>
                            )}
                        </label>
                        <input data-testid="image" type="file" id="image" {...register('img')} />
                        <div className="form-group-image-loaded">
                            {watchedImg instanceof FileList && watchedImg.length > 0
                                ? Array.from(watchedImg).map((f) => (
                                      <div key={f.name} data-testid="uploaded-file">
                                          {f.name}
                                      </div>
                                  ))
                                : null}
                        </div>
                        {errors.img && <p className="error">{errors.img.message}</p>}
                    </div>
                </div>
            </div>
        </form>
    );
};
