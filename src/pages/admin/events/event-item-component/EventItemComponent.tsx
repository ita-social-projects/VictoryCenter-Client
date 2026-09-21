import { VisibilityStatusLabel } from '@/components/admin/visibility-status-label/VisibilityStatusLabel';
import { ACTION_ICONS } from '@/const/common/action-icons';
import { IconButton } from '@/components/admin/icon-button/IconButton';
import { EventItemDto } from '@/types/admin/events-news';
import './EventItemComponent.scss';

export interface EventItemComponentProps {
    item: EventItemDto;
}

export const EventItemComponent = ({ item }: EventItemComponentProps) => {
    return (
        <div className="event-item">
            <div className="event-info">
                <div className="event-item-main">
                    <div className="event-item-date">{new Date(item.publishedAt).toLocaleDateString('uk-UA')}</div>

                    <div className="event-info-title">
                        <p>{item.title}</p>
                    </div>
                </div>

                <div className="event-info-description">
                    <p>{item.description}</p>
                </div>

                <div className="event-item-info-status">
                    <VisibilityStatusLabel status={item.status} />
                </div>
            </div>

            <div className="event-item-actions">
                <IconButton
                    area-label="edit"
                    type="button"
                    onClick={() => {}}
                    DefaultIcon={ACTION_ICONS.edit.default}
                    FilledIcon={ACTION_ICONS.edit.hover}
                />

                <IconButton
                    area-label="delete"
                    type="button"
                    onClick={() => {}}
                    DefaultIcon={ACTION_ICONS.delete.default}
                    FilledIcon={ACTION_ICONS.delete.hover}
                />
            </div>
        </div>
    );
};
