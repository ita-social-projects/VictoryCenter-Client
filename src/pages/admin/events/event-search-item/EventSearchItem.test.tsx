import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { EventSearchItem } from './EventSearchItem';
import { SearchItemContentRef } from '@/components/admin/search-bar/search-item-wrapper/SearchItemWrapper';
import { EventItemDto } from '@/types/admin/events';
import { VisibilityStatus } from '@/types/admin/common';

const createItem = (overrides: Partial<EventItemDto>): EventItemDto => ({
    id: 1,
    resource: '',
    publishedAt: '2024-01-15T00:00:00.000Z',
    title: 'Default title',
    description: 'Default description',
    status: VisibilityStatus.Published,
    previewImage: null,
    backgroundImage: null,
    priority: 1,
    categories: [],
    ...overrides,
});

const renderComponent = (item: EventItemDto) => {
    const ref = createRef<SearchItemContentRef>();

    const view = render(
        <EventSearchItem item={item} isSearchItemActive={false} isSearchItemHovered={false} ref={ref} />,
    );

    return { ref, ...view };
};

describe('EventSearchItem', () => {
    it('renders the full title when it is within the truncation limit', () => {
        const item = createItem({ id: 1, title: 'Short event title' });

        renderComponent(item);

        expect(screen.getByText('Short event title')).toBeInTheDocument();
    });

    it('truncates the title with an ellipsis when it exceeds 50 characters', () => {
        const longTitle = 'a'.repeat(60);
        const item = createItem({ id: 2, title: longTitle });

        renderComponent(item);

        expect(screen.getByText(`${'a'.repeat(50)}...`)).toBeInTheDocument();
    });

    it('returns null for the tooltip content', () => {
        const item = createItem({ id: 3, title: 'Another event' });

        const { ref } = renderComponent(item);

        expect(ref.current?.getTooltipContent()).toBeNull();
    });
});
