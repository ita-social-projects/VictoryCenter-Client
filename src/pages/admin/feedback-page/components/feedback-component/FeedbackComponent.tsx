import { useState, useEffect } from 'react';
import { ReactComponent as BlankUserImage } from '@/assets/icons/blank-user.svg';
import { IconButton } from '@/components/admin/icon-button/IconButton';
import { ACTION_ICONS } from '@/const/common/action-icons';
import { FEEDBACK_TEXT } from '@/const/admin/feedback';
import { FeedbackListItem } from '@/types/admin/feedback';
import './FeedbackComponent.scss';

export interface FeedbackComponentProps {
    item: FeedbackListItem;
    showPhoto?: boolean;
    onEdit?: (item: FeedbackListItem) => void;
    onDelete?: (item: FeedbackListItem) => void;
}

export const FeedbackComponent = ({ item, showPhoto = false, onEdit, onDelete }: FeedbackComponentProps) => {
    const [imgError, setImgError] = useState(false);
    const title = item.title || item.authorName || '';
    const description = item.story || item.text || item.videoUrl || '';
    const imageUrl = item.image && 'url' in item.image ? item.image.url : null;

    useEffect(() => {
        setImgError(false);
    }, [imageUrl]);

    const handleEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        e.preventDefault();
        onEdit?.(item);
    };

    const handleDelete = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        e.preventDefault();
        onDelete?.(item);
    };

    return (
        <div className="feedback-item">
            <div className="feedback-profile">
                {showPhoto &&
                    (imgError || !imageUrl ? (
                        <BlankUserImage className="feedback-icon" />
                    ) : (
                        <img src={imageUrl} alt={title} onError={() => setImgError(true)} />
                    ))}
                <div className="feedback-profile-data">
                    <p>{title}</p>
                </div>
            </div>

            <div className="feedback-position">
                <p>{description}</p>
            </div>

            <div className="feedback-controls">
                <div className="feedback-actions">
                    <IconButton
                        aria-label={FEEDBACK_TEXT.ACTIONS.EDIT}
                        type="button"
                        onClick={handleEdit}
                        DefaultIcon={ACTION_ICONS.edit.default}
                        FilledIcon={ACTION_ICONS.edit.hover}
                    />
                    <IconButton
                        aria-label={FEEDBACK_TEXT.ACTIONS.DELETE}
                        type="button"
                        onClick={handleDelete}
                        DefaultIcon={ACTION_ICONS.delete.default}
                        FilledIcon={ACTION_ICONS.delete.hover}
                    />
                </div>
            </div>
        </div>
    );
};
