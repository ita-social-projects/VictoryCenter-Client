import { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { InputLabel } from '@/components/admin/input-label/InputLabel';
import { InputError } from '@/components/admin/input-error/InputError';
import { TextAreaWithCharacterLimit } from '@/components/admin/textarea-with-character-limit/TextAreaWithCharacterLimit';
import '@/components/admin/input-groups/input-group.scss';
import { FEEDBACK_TEXT, VIDEO_REVIEW_VALIDATION } from '@/const/admin/feedback';
import { VisibilityStatus } from '@/types/admin/common';
import { GenericFormRef } from '@/hooks/admin/use-generic-modal/useGenericModal';
import { VIDEO_REVIEW_VALIDATION_FUNCTIONS } from '@/validation/admin/video-review-schema/video-review-schema';
import {
    getNormalizedInputText,
    getNormalizedInputTextWhileTyping,
} from '@/utils/functions/formatters/text-formatters';

export interface VideoReviewFormValues {
    title: string;
    link: string;
}

export type VideoReviewFormRef = GenericFormRef;

export interface VideoReviewFormProps {
    initialData: VideoReviewFormValues | null;
    formDisabled?: boolean;
    onSubmit: (data: VideoReviewFormValues, status: VisibilityStatus) => void;
    onValidationChange?: (isValid: boolean) => void;
}

const DEFAULT_FORM_STATE: VideoReviewFormValues = { title: '', link: '' };

export const VideoReviewForm = forwardRef<VideoReviewFormRef, VideoReviewFormProps>(
    ({ initialData, formDisabled, onSubmit, onValidationChange }, ref) => {
        const initialValues = initialData ?? DEFAULT_FORM_STATE;
        const [title, setTitle] = useState(initialValues.title);
        const [link, setLink] = useState(initialValues.link);
        const [titleError, setTitleError] = useState<string | undefined>();
        const [linkError, setLinkError] = useState<string | undefined>();

        const isValid =
            VIDEO_REVIEW_VALIDATION_FUNCTIONS.validateTitle(title) === undefined &&
            VIDEO_REVIEW_VALIDATION_FUNCTIONS.validateLink(link) === undefined;
        const isDirty = title !== initialValues.title || link !== initialValues.link;

        useImperativeHandle(
            ref,
            () => ({
                submit: async (status: VisibilityStatus) => {
                    if (isValid) onSubmit({ title, link }, status);
                },
                isDirty: () => isDirty,
                isValid: () => isValid,
            }),
            [title, link, isValid, isDirty, onSubmit],
        );

        useEffect(() => {
            onValidationChange?.(isValid);
        }, [isValid, isDirty, onValidationChange]);

        const handleTitleBlur = useCallback(() => {
            setTitle((current) => {
                const normalized = getNormalizedInputText(current);
                setTitleError(VIDEO_REVIEW_VALIDATION_FUNCTIONS.validateTitle(normalized));
                return normalized;
            });
        }, []);

        const handleLinkBlur = useCallback(() => {
            setLink((current) => {
                const normalized = getNormalizedInputText(current);
                setLinkError(VIDEO_REVIEW_VALIDATION_FUNCTIONS.validateLink(normalized));
                return normalized;
            });
        }, []);

        return (
            <form onSubmit={(e) => e.preventDefault()} noValidate data-testid="video-review-form">
                <InputWithCharacterLimitGroup
                    isRequired
                    label={FEEDBACK_TEXT.ADD_VIDEO_REVIEW_MODAL.LABEL.TITLE}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={handleTitleBlur}
                    name="video-review-title"
                    id="video-review-title"
                    type="text"
                    maxLength={VIDEO_REVIEW_VALIDATION.title.max}
                    error={titleError}
                    disabled={formDisabled}
                    showCounterBelow
                    normalizeValue={getNormalizedInputTextWhileTyping}
                />

                <div className="input-group">
                    <InputLabel
                        htmlFor="video-review-link"
                        text={FEEDBACK_TEXT.ADD_VIDEO_REVIEW_MODAL.LABEL.LINK}
                        isRequired
                    />
                    <TextAreaWithCharacterLimit
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        onBlur={handleLinkBlur}
                        name="video-review-link"
                        id="video-review-link"
                        maxLength={VIDEO_REVIEW_VALIDATION.link.max}
                        hasError={!!linkError}
                        disabled={formDisabled}
                        rows={4}
                        autoGrow
                        normalizeValue={getNormalizedInputTextWhileTyping}
                    />
                    <InputError error={linkError} />
                </div>
            </form>
        );
    },
);
