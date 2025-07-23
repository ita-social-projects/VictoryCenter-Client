import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { TeamCategory } from '../../../../../types/TeamPage';
import {
    TEAM_CATEGORY_MAIN,
    TEAM_CATEGORY_SUPERVISORY,
    TEAM_CATEGORY_ADVISORS,
    TEAM_LABEL_CATEGORY,
    TEAM_LABEL_SELECT_CATEGORY,
    TEAM_LABEL_FULLNAME,
    TEAM_LABEL_DESCRIPTION,
} from '../../../../../const/team';
import { ImageUploadField } from '../member-photo-uploader/ImageUploadField';
import { Image, ImageValues } from '../../../../../types/Image';

export type MemberFormValues = {
    category: TeamCategory;
    fullName: string;
    description: string;
    image: Image | null;
};

export type MemberFormProps = {
    id: string;
    onSubmit: (memberFormValues: MemberFormValues) => void;
    existingMemberFormValues?: MemberFormValues | null;
    onValuesChange?: (memberFormValues: MemberFormValues) => void;
};

const MAX_FULLNAME_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 200;
export const MemberForm = ({ onSubmit, id, existingMemberFormValues = null, onValuesChange }: MemberFormProps) => {
    const [memberFormValues, setMemberFormValues] = useState<MemberFormValues>(
        existingMemberFormValues || {
            fullName: '',
            image: null,
            description: '',
            category: '' as TeamCategory,
        },
    );
    const handleOnSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (memberFormValues?.category && memberFormValues?.description && memberFormValues?.fullName) {
            console.log('onValuesChange', memberFormValues);
            onSubmit(memberFormValues);
        }
    };

    const handleMemberFormValuesChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => {
        const { name, value } = e.target;
        if (name !== 'imgId') {
            setMemberFormValues((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const onFileChange = (item: ImageValues) => {
        var newImage: Image = {
            id: existingMemberFormValues?.image?.id ?? null,
            base64: item.base64,
            mimeType: item.mimeType,
        };
        setMemberFormValues((prev) => ({
            ...prev,
            image: newImage,
        }));
    };

    useEffect(() => {
        if (onValuesChange && memberFormValues) {
            onValuesChange(memberFormValues);
        }
    }, [memberFormValues, onValuesChange]);

    return (
        <form id={id} onSubmit={handleOnSubmit} data-testid="test-form">
            <div className="members-add-modal-body">
                <div className="form-group">
                    <label htmlFor="category">{TEAM_LABEL_CATEGORY}</label>
                    <select
                        value={memberFormValues ? memberFormValues.category : ''}
                        onChange={handleMemberFormValuesChange}
                        name="category"
                        id="category"
                    >
                        <option value="" disabled>
                            {TEAM_LABEL_SELECT_CATEGORY}
                        </option>
                        <option value={TEAM_CATEGORY_MAIN}>{TEAM_CATEGORY_MAIN}</option>
                        <option value={TEAM_CATEGORY_SUPERVISORY}>{TEAM_CATEGORY_SUPERVISORY}</option>
                        <option value={TEAM_CATEGORY_ADVISORS}>{TEAM_CATEGORY_ADVISORS}</option>
                    </select>
                </div>
                <div className="form-group">
                    <label htmlFor="fullName">{TEAM_LABEL_FULLNAME}</label>
                    <input
                        value={memberFormValues ? memberFormValues.fullName : ''}
                        maxLength={MAX_FULLNAME_LENGTH}
                        onChange={handleMemberFormValuesChange}
                        name="fullName"
                        type="text"
                        id="fullName"
                    />
                    <div className="form-group-fullname-length-limit">
                        {memberFormValues?.fullName ? memberFormValues.fullName.length : 0}/{MAX_FULLNAME_LENGTH}
                    </div>
                </div>
                <div className="form-group">
                    <label htmlFor="description">{TEAM_LABEL_DESCRIPTION}</label>
                    <textarea
                        value={memberFormValues ? memberFormValues.description : ''}
                        maxLength={MAX_DESCRIPTION_LENGTH}
                        onChange={handleMemberFormValuesChange}
                        name="description"
                        className="form-group-description"
                        id="description"
                    />
                    <div className="form-group-description-length-limit">
                        {memberFormValues?.description ? memberFormValues.description.length : 0}/
                        {MAX_DESCRIPTION_LENGTH}
                    </div>
                </div>
                <ImageUploadField
                    image={memberFormValues.image}
                    onChange={(image: ImageValues) => onFileChange(image)}
                />
            </div>
        </form>
    );
};
