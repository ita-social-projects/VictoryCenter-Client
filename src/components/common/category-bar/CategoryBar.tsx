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
    selectedCategory: T | undefined;
    displayContextMenu?: boolean;
    getItemName: (item: T) => string;
    getItemKey: (item: T) => string | number;
    onCategorySelect: (category: T) => void;
    contextMenuOptions?: ContextMenuOption[];
    onContextMenuOptionSelected?: (id: string) => void;
}

export const CategoryBar = <T,>({
    categories,
    selectedCategory,
    displayContextMenu = false,
    getItemName,
    getItemKey,
    onCategorySelect,
    contextMenuOptions = [],
    onContextMenuOptionSelected,
}: CategoryBarProps<T>) => {
    const handleContextMenuOptionSelected = (id: string) => {
        onContextMenuOptionSelected?.(id);
    };

    return (
        <div className="category-bar">
            {displayContextMenu && contextMenuOptions.length > 0 && (
                <ContextMenuButton onOptionSelected={handleContextMenuOptionSelected}>
                    {contextMenuOptions.map((option) => (
                        <ContextMenuButton.Option key={option.id} value={option.id}>
                            {option.name}
                        </ContextMenuButton.Option>
                    ))}
                </ContextMenuButton>
            )}
            {categories.map((category) => {
                const key = getItemKey(category);
                const name = getItemName(category);
                const selected = !!selectedCategory && key === getItemKey(selectedCategory);

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
