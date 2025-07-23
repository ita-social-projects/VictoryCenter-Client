import CloudDownload from '../../../../../assets/icons/cloud-download.svg';
import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { TeamCategory } from '../../../../../types/admin/TeamMembers';
import {
    TEAM_LABEL_CATEGORY,
    TEAM_LABEL_SELECT_CATEGORY,
    TEAM_LABEL_FULLNAME,
    TEAM_LABEL_DESCRIPTION,
    TEAM_LABEL_PHOTO,
    TEAM_LABEL_DRAG_DROP,
} from '../../../../../const/team';
import { ImageUploadField } from '../member-photo-uploader/ImageUploadField';
import { Image, ImageValues } from '../../../../../types/Image';
import { useAdminClient } from '../../../../../utils/hooks/use-admin-client/useAdminClient';
import { TeamCategoriesApi } from '../../../../../services/data-fetch/admin-page-data-fetch/team-page-data-fetch/TeamCategoriesApi/TeamCategoriesApi';

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
    onError?: (msg: string | null) => void;
};

const MAX_FULLNAME_LENGTH = 50;
const MAX_DESCRIPTION_LENGTH = 200;
export const MemberForm = ({
    onSubmit,
    id,
    existingMemberFormValues = null,
    onValuesChange,
    onError,
}: MemberFormProps) => {
    const client = useAdminClient();
    const [categories, setCategories] = useState<TeamCategory[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(true);
    const [memberFormValues, setMemberFormValues] = useState<MemberFormValues>(
        existingMemberFormValues || {
            fullName: '',
            image: null,
            description: '',
            category: null as unknown as TeamCategory,
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
        const inputTarget = e.currentTarget as EventTarget & HTMLInputElement;
        if (name === 'category') {
            const selectedCategory = categories.find((c) => c.name === value);
            setMemberFormValues((prev) => ({
                ...prev,
                category: selectedCategory as TeamCategory,
            }));
            return;
        }
        if (inputTarget.files && inputTarget.files.length > 0) {
            const file = inputTarget.files;
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

    const handleFileDrop = (e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();

        const files = e.dataTransfer.files;
        if (files) {
            setMemberFormValues((prev) => ({
                ...prev,
                img: files,
            }));
        }
    };

    return (
        <form id={id} onSubmit={handleOnSubmit} data-testid="test-form">
            <div className="members-add-modal-body">
                <div className="form-group">
                    <label htmlFor="category">{TEAM_LABEL_CATEGORY}</label>
                    <select
                        value={memberFormValues?.category?.name ?? ''}
                        onChange={handleMemberFormValuesChange}
                        name="category"
                        id="category"
                        disabled={isLoadingCategories}
                    >
                        <option value="" disabled>
                            {TEAM_LABEL_SELECT_CATEGORY}
                        </option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.name}>
                                {category.name}
                            </option>
                        ))}
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
