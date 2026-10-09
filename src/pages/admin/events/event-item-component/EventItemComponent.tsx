import { VisibilityStatusLabel } from '@/components/admin/visibility-status-label/VisibilityStatusLabel';
import { ACTION_ICONS } from '@/const/common/action-icons';
import { IconButton } from '@/components/admin/icon-button/IconButton';
import { LocalizationStatuses } from '@/components/admin/localization-statuses/LocalizationStatuses';
import { EventItemDto } from '@/types/admin/events';
import { EntityLocalization, LocalizationLanguage } from '@/types/common/language';
import { EVENT_ITEMS_TEXT } from '@/const/admin/events';
import './EventItemComponent.scss';

export interface EventItemComponentProps {
    item: EventItemDto;
    onEdit: (item: EventItemDto) => void;
    language?: LocalizationLanguage;
    translationLanguages?: LocalizationLanguage[];
}

export const EventItemComponent = ({ item, onEdit, language, translationLanguages = [] }: EventItemComponentProps) => {
    const displayedLocalization = language
        ? item.localizations?.find((localization) => localization.language.code === language.code)
        : undefined;
    const title = displayedLocalization?.title || item.title;
    const description = displayedLocalization?.description || item.description;

    return (
        <div className="event-item">
            <div className="event-info">
                <div className="event-item-main">
                    <div className="event-item-date">{new Date(item.publishedAt).toLocaleDateString('uk-UA')}</div>

                    <div className="event-info-title">
                        <p>{title}</p>
                        <LocalizationStatuses<EntityLocalization>
                            languages={translationLanguages}
                            localizedEntity={item}
                        />
                    </div>
                </div>

                <div className="event-info-description">
                    <p>{description}</p>
                </div>

                <div className="event-item-info-status">
                    <VisibilityStatusLabel status={item.status} />
                </div>
            </div>

            <div className="event-item-actions">
                <IconButton
                    aria-label={EVENT_ITEMS_TEXT.ACTIONS.EDIT}
                    type="button"
                    onClick={() => onEdit(item)}
                    DefaultIcon={ACTION_ICONS.edit.default}
                    FilledIcon={ACTION_ICONS.edit.hover}
                />

                <IconButton
                    aria-label={EVENT_ITEMS_TEXT.ACTIONS.DELETE}
                    type="button"
                    onClick={() => {
                        /*TODO: add implementation.*/
                    }}
                    DefaultIcon={ACTION_ICONS.delete.default}
                    FilledIcon={ACTION_ICONS.delete.hover}
                />
            </div>
        </div>
    );
};
