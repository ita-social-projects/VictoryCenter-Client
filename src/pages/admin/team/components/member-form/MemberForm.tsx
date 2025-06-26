import CloudDownload from "../../../../../assets/icons/cloud-download.svg";
import React, { useEffect, useState } from "react";
import { useCreateMemberForm } from "../../../../../hooks/admin/create-member-form";
import '../members-list/members-list.scss'
import {TeamCategory} from "../../TeamPage";
import {
  TEAM_CATEGORY_MAIN,
  TEAM_CATEGORY_SUPERVISORY,
  TEAM_CATEGORY_ADVISORS,
  TEAM_LABEL_CATEGORY,
  TEAM_LABEL_SELECT_CATEGORY,
  TEAM_LABEL_FULLNAME,
  TEAM_LABEL_DESCRIPTION,
  TEAM_LABEL_PHOTO,
  TEAM_LABEL_DRAG_DROP
} from '../../../../../const/team';

export type MemberFormValues = {
    category: TeamCategory,
    fullName: string,
    description: string,
    img: FileList | null
};

export type MemberFormProps = {
    id: string;
    onSubmit: (memberFormValues: MemberFormValues) => void;
    existingMemberFormValues?: MemberFormValues | null;
    onValuesChange?: (memberFormValues: MemberFormValues) => void;
};

const MAX_FULLNAME_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 200;
export const MemberForm = ({onSubmit, id, existingMemberFormValues = null, onValuesChange}: MemberFormProps) => {

    const [isInitialized, setIsInitialized] = useState(false);
    
    const {
        register,
        watch,
        handleSubmit,
        reset,
        setValue,
        formState: { errors }
    } = useCreateMemberForm();
    
    const watchedImg = watch("img");

    const handleOnSubmit = (data: MemberFormValues) => {
        if (data.category && data.description && data.fullName) {
            onSubmit(data);
        }
    };

    useEffect(() => {
        if (existingMemberFormValues && !isInitialized) {
            reset(existingMemberFormValues);
            setIsInitialized(true);
        }
    }, [existingMemberFormValues, isInitialized, reset]);

    const watchedValues = watch();
    
    useEffect(() => {
        if (onValuesChange) {
            onValuesChange(watchedValues);
        }
    }, [watchedValues, onValuesChange]);

    const handleFileDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();

        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            setValue("img", files, { shouldValidate: true }); // <- передаємо файли в форму
        }
    }

    return (<form id={id} onSubmit={handleSubmit(handleOnSubmit)} data-testid="test-form">
        <div className='members-add-modal-body'>
            <div className='form-group'>
                <label htmlFor="category">{TEAM_LABEL_CATEGORY}</label>
                <select defaultValue={existingMemberFormValues ? existingMemberFormValues.category : ''}
                        id="category"
                        {...register("category")}>
                    <option value="" disabled>{TEAM_LABEL_SELECT_CATEGORY}</option>
                    <option value={TEAM_CATEGORY_MAIN}>{TEAM_CATEGORY_MAIN}</option>
                    <option value={TEAM_CATEGORY_SUPERVISORY}>{TEAM_CATEGORY_SUPERVISORY}</option>
                    <option value={TEAM_CATEGORY_ADVISORS}>{TEAM_CATEGORY_ADVISORS}</option>
                </select>
                {errors.category && <p className="error">{errors.category.message}</p>}
            </div>
            
            <div className='form-group'>
                <label htmlFor="fullName">{TEAM_LABEL_FULLNAME}</label>
                <input maxLength={MAX_FULLNAME_LENGTH} 
                       type="text" id='fullName'
                       {...register("fullName")}/>
                <div
                    className='form-group-fullname-length-limit'>{watch("fullName")?.length || 0}/{MAX_FULLNAME_LENGTH}</div>
                {errors.fullName && <p className="error">{errors.fullName.message}</p>}
            </div>
            
            <div className='form-group'>
                <label htmlFor="description">{TEAM_LABEL_DESCRIPTION}</label>
                <textarea maxLength={MAX_DESCRIPTION_LENGTH} 
                          className='form-group-description'
                          id='description'
                          {...register("description")}/>
                <div
                    className='form-group-description-length-limit'>{watch("description")?.length || 0}/{MAX_DESCRIPTION_LENGTH}</div>
                {errors.description && <p className="error">{errors.description.message}</p>}
            </div>
            
            <div className='form-group form-group-image'>
                <span><span className='form-group-image-required'>*</span>{TEAM_LABEL_PHOTO}</span>
                <div className='form-group-image-details'>
                    <label
                        onDragOver={e => e.preventDefault()}
                        onDragLeave={e => e.preventDefault()}
                        onDrop={handleFileDrop}
                        htmlFor="image" className='form-group-image-choose-file'>
                        <div className='form-group-image-choose-file-inner' data-testid='drop-area'>
                            <img src={CloudDownload} alt="cloud-download"/>
                            <span>{TEAM_LABEL_DRAG_DROP}</span>
                        </div>
                    </label>
                    <input data-testid="image"
                           type='file'
                           id='image'
                           {...register("img")}/>
                    <div className='form-group-image-loaded'>
                        {(watchedImg && watchedImg.length > 0) ? (
                            Array.from(watchedImg).map(f => (<div key={f.name}>{f.name}</div>))
                        ) : (<div></div>)}
                    </div>
                    {errors.img && <p className="error">{errors.img.message}</p>}
                </div>
            </div>
        </div>
    </form>);
};
