import { forwardRef, useImperativeHandle } from 'react';
import {
    SearchItemContentRef,
    SearchItemContentRenderProps,
} from '@/components/admin/search-bar/search-item-wrapper/SearchItemWrapper';
import { EventItemDto } from '@/types/admin/events';
import { truncateWithEllipsis } from '@/utils/functions/truncate-with-ellipsis/truncate-with-ellipsis';
import './EventSearchItem.scss';

const TITLE_MAX_LENGTH = 50;

export const EventSearchItem = forwardRef<SearchItemContentRef, SearchItemContentRenderProps<EventItemDto>>(
    ({ item }, ref) => {
        useImperativeHandle(ref, () => ({
            getTooltipContent: () => null,
        }));

        return <span className="event-search-item">{truncateWithEllipsis(item.title, TITLE_MAX_LENGTH)}</span>;
    },
);
