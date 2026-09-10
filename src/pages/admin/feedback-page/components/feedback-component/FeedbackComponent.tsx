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

const getFeedbackDescription = (item: FeedbackListItem): string => {
    if ('story' in item) return item.story;
    if ('text' in item) return item.text;
    if ('link' in item) return item.link;
    return '';
};

export const FeedbackComponent = ({ item, showPhoto = false, onEdit, onDelete }: FeedbackComponentProps) => {
    const [imgError, setImgError] = useState(false);
    const isVideo = 'link' in item;
    const title = ('title' in item ? item.title : item.authorName) || '';
    const description = getFeedbackDescription(item) || '';
    const imageUrl = 'image' in item && item.image && 'url' in item.image ? item.image.url : null;

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
                <div className={`feedback-profile-data${isVideo ? ' feedback-truncate' : ''}`}>
                    <p>{title}</p>
                </div>
            </div>

            <div className={`feedback-position${isVideo ? ' feedback-truncate' : ''}`}>
                {isVideo ? (
                    <a href={description} target="_blank" rel="noreferrer">
                        {description}
                    </a>
                ) : (
                    <p>{description}</p>
                )}
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
