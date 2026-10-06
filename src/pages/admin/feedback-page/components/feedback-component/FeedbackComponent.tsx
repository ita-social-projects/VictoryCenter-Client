import { useState, useEffect, useMemo } from 'react';
import { ReactComponent as BlankUserImage } from '@/assets/icons/blank-user.svg';
import { IconButton } from '@/components/admin/icon-button/IconButton';
import { LocalizationStatuses } from '@/components/admin/localization-statuses/LocalizationStatuses';
import { ACTION_ICONS } from '@/const/common/action-icons';
import { FEEDBACK_TEXT } from '@/const/admin/feedback';
import { FeedbackListItem } from '@/types/admin/feedback';
import { EntityLocalization, EntityWithLocalizations, LocalizationLanguage } from '@/types/common/language';
import { returnDisplayedLocalization } from '@/utils/functions/localization/localization';
import './FeedbackComponent.scss';

export interface FeedbackComponentProps {
    item: FeedbackListItem;
    showPhoto?: boolean;
    language?: LocalizationLanguage;
    translationLanguages?: LocalizationLanguage[];
    onEdit?: (item: FeedbackListItem) => void;
    onDelete?: (item: FeedbackListItem) => void;
    onTranslate?: (item: FeedbackListItem) => void;
}

type FeedbackLocalizableFields = Partial<Record<'title' | 'story' | 'authorName' | 'text', string>>;

const getFeedbackTitle = (item: FeedbackListItem, loc: FeedbackLocalizableFields | null): string => {
    if ('title' in item) return loc?.title || item.title || '';
    return loc?.authorName || item.authorName || '';
};

const getFeedbackDescription = (item: FeedbackListItem, loc: FeedbackLocalizableFields | null): string => {
    if ('story' in item) return loc?.story || item.story || '';
    if ('text' in item) return loc?.text || item.text || '';
    if ('link' in item) return item.link || '';
    return '';
};

export const FeedbackComponent = ({
    item,
    showPhoto = false,
    language,
    translationLanguages = [],
    onEdit,
    onDelete,
    onTranslate,
}: FeedbackComponentProps) => {
    const [imgError, setImgError] = useState(false);
    const isVideo = 'link' in item;

    const displayedLocalization = useMemo(() => {
        if (!language || !item.localizations) return null;
        return returnDisplayedLocalization(
            item as EntityWithLocalizations<EntityLocalization & FeedbackLocalizableFields>,
            language.code,
        );
    }, [item, language]);

    const title = getFeedbackTitle(item, displayedLocalization);
    const description = getFeedbackDescription(item, displayedLocalization);
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

    const handleTranslate = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        e.preventDefault();
        onTranslate?.(item);
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
                    <p title={title}>{title}</p>
                    <LocalizationStatuses<EntityLocalization> languages={translationLanguages} localizedEntity={item} />
                </div>
            </div>

            <div className={`feedback-position${isVideo ? ' feedback-truncate' : ''}`}>
                {isVideo ? (
                    <a href={description} target="_blank" rel="noreferrer" title={description}>
                        {description}
                    </a>
                ) : (
                    <p title={description}>{description}</p>
                )}
            </div>

            <div className="feedback-controls">
                <div className="feedback-actions">
                    <IconButton
                        aria-label={FEEDBACK_TEXT.ACTIONS.TRANSLATE}
                        type="button"
                        onClick={handleTranslate}
                        DefaultIcon={ACTION_ICONS.translate.default}
                    />
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
