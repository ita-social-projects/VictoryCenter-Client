import React from 'react';

interface ListContentProps<T> {
    items: T[];
    isLoading: boolean;
    renderItem: (item: T, index: number) => React.ReactNode;
    emptyState?: React.ReactNode;
}

export function ListContent<T>({
    items,
    isLoading,
    renderItem,
    emptyState = <p>Елементів не знайдено.</p>, //TODO
}: ListContentProps<T>) {
    if (items.length > 0) {
        return <>{items.map(renderItem)}</>;
    } else if (!isLoading) {
        return <>{emptyState}</>;
    } else {
        return null;
    }
}
