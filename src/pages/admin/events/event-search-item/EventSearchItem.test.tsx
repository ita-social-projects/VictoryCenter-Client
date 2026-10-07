import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { EventSearchItem } from './EventSearchItem';
import { SearchItemContentRef } from '@/components/admin/search-bar/search-item-wrapper/SearchItemWrapper';
import { EventSearchItemData } from '@/types/admin/events';

const renderComponent = (item: EventSearchItemData) => {
    const ref = createRef<SearchItemContentRef>();

    const view = render(
        <EventSearchItem item={item} isSearchItemActive={false} isSearchItemHovered={false} ref={ref} />,
    );

    return { ref, ...view };
};

describe('EventSearchItem', () => {
    it('renders the full title when it is within the truncation limit', () => {
        const item: EventSearchItemData = { id: 1, title: 'Short event title', categories: [] };

        renderComponent(item);

        expect(screen.getByText('Short event title')).toBeInTheDocument();
    });

    it('truncates the title with an ellipsis when it exceeds 50 characters', () => {
        const longTitle = 'a'.repeat(60);
        const item: EventSearchItemData = { id: 2, title: longTitle, categories: [] };

        renderComponent(item);

        expect(screen.getByText(`${'a'.repeat(50)}...`)).toBeInTheDocument();
    });

    it('returns null for the tooltip content', () => {
        const item: EventSearchItemData = { id: 3, title: 'Another event', categories: [] };

        const { ref } = renderComponent(item);

        expect(ref.current?.getTooltipContent()).toBeNull();
    });
});
