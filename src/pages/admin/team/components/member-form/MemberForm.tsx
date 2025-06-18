import CloudDownload from "../../../../../assets/icons/cloud-download.svg";
import React, {ChangeEvent, FormEvent, useEffect, useState} from "react";
import {TeamCategory} from "../../TeamPage";

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
    const [memberFormValues, setMemberFormValues] = useState<MemberFormValues>(existingMemberFormValues || {
        fullName: '',
        img: null,
        description: '',
        category: '' as TeamCategory
    });
    const handleOnSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(memberFormValues?.category && memberFormValues?.description && memberFormValues?.fullName) {
            onSubmit(memberFormValues);
        }
    }

    const handleMemberFormValuesChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        const inputTarget = e.currentTarget as (EventTarget & HTMLInputElement);
        if (inputTarget.files && inputTarget.files.length > 0) {
            const file = inputTarget.files;
            setMemberFormValues((prev) => ({
                ...prev,
                img: file
            }));
        } else {
            setMemberFormValues((prev) => ({
                ...prev,
                [name]: value
            }));
        }
    }

    useEffect(() => {
        if (onValuesChange && memberFormValues) {
            onValuesChange(memberFormValues)
        }
    }, [memberFormValues, onValuesChange]);

    const handleFileDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();

        const files = e.dataTransfer.files;
        if (files) {
            setMemberFormValues((prev) => ({
                ...prev,
                img: files
            }));
        }
    }

    return (<form id={id} onSubmit={handleOnSubmit} data-testid="test-form">
        <div className='members-add-modal-body'>
            <div className='form-group'>
                <label htmlFor="category">Категорія</label>
                <select value={memberFormValues ? memberFormValues.category : ''} onChange={handleMemberFormValuesChange} name="category" id="category">
                    <option value="" selected disabled>Виберіть категорію</option>
                    <option value="Основна команда">Основна команда</option>
                    <option value="Наглядова рада">Наглядова рада</option>
                    <option value="Радники">Радники</option>
                </select>
            </div>
            <div className='form-group'>
                <label htmlFor="fullName">Ім'я та Прізвище</label>
                <input value={memberFormValues ? memberFormValues.fullName : ''} maxLength={MAX_FULLNAME_LENGTH} onChange={handleMemberFormValuesChange} name='fullName'
                       type="text" id='fullName'/>
                <div
                    className='form-group-fullname-length-limit'>{memberFormValues?.fullName ? memberFormValues.fullName.length : 0}/{MAX_FULLNAME_LENGTH}</div>
            </div>
            <div className='form-group'>
                <label htmlFor="description">Опис</label>
                <textarea value={memberFormValues ? memberFormValues.description : ''} maxLength={MAX_DESCRIPTION_LENGTH} onChange={handleMemberFormValuesChange}
                          name='description' className='form-group-description' id='description'/>
                <div
                    className='form-group-description-length-limit'>{memberFormValues?.description ? memberFormValues.description.length : 0}/{MAX_DESCRIPTION_LENGTH}</div>
            </div>
            <div className='form-group form-group-image'>
                <span><span className='form-group-image-required'>*</span>Фото</span>
                <div className='form-group-image-details'>
                    <label
                        onDragOver={e => e.preventDefault()}
                        onDragLeave={e => e.preventDefault()}
                        onDrop={handleFileDrop}
                        htmlFor="image" className='form-group-image-choose-file'>
                        <div className='form-group-image-choose-file-inner' data-testid='drop-area'>
                            <img src={CloudDownload} alt="cloud-download"/>
                            <span>Перетягніть файл сюди або натисніть для завантаження</span>
                        </div>
                    </label>
                    <input data-testid="image" onChange={handleMemberFormValuesChange} name='img' type="file" id='image'/>
                    <div className='form-group-image-loaded'>
                        {(memberFormValues.img) ? (
                            Array.from(memberFormValues.img).map(f => (<div key={f.name}>{f.name}</div>))
                        ) : (<div></div>)}
                    </div>
                </div>
            </div>
        </div>
    </form>);
}
