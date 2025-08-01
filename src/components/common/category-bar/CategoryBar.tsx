import React from 'react';
import classNames from 'classnames';
import { ContextMenuButton } from '../context-menu-button/ContextMenuButton';
import './category-bar.scss';

export interface ContextMenuOption {
    id: string;
    name: string;
}

export interface CategoryBarProps<T> {
    categories: T[];
    selectedCategory: T | null;
    displayContextMenuButton?: boolean;
    getCategoryDisplayName: (item: T) => string;
    getCategoryKey: (item: T) => string | number;
    onCategorySelect: (category: T) => void;
    contextMenuOptions?: ContextMenuOption[];
    onContextMenuOptionSelected?: (id: string) => void;
}

export const CategoryBar = <T,>({
    categories,
    selectedCategory,
    displayContextMenuButton = false,
    getCategoryDisplayName,
    getCategoryKey,
    onCategorySelect,
    contextMenuOptions = [],
    onContextMenuOptionSelected,
}: CategoryBarProps<T>) => {
    const handleContextMenuOptionSelected = (id: string) => {
        onContextMenuOptionSelected?.(id);
    };

    return (
        <div className="category-bar">
            {displayContextMenuButton && contextMenuOptions.length > 0 && (
                <ContextMenuButton onOptionSelected={handleContextMenuOptionSelected}>
                    {contextMenuOptions.map((option) => (
                        <ContextMenuButton.Option key={option.id} value={option.id}>
                            {option.name}
                        </ContextMenuButton.Option>
                    ))}
                </ContextMenuButton>
            )}
            {categories.map((category) => {
                const key = getCategoryKey(category);
                const name = getCategoryDisplayName(category);
                const selected = !!selectedCategory && key === getCategoryKey(selectedCategory);

                return (
                    <button
                        key={key}
                        onClick={() => onCategorySelect(category)}
                        className={classNames('category-bar-button', {
                            'category-bar-button-selected': selected,
                        })}
                    >
                        {name}
                    </button>
                );
            })}
        </div>
    );
};
