import React from 'react';
import classNames from 'classnames';
import ContextMenu from '../context-menu/ContextMenu';
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
                <ContextMenu onOptionSelected={handleContextMenuOptionSelected}>
                    {contextMenuOptions.map((option) => (
                        <ContextMenu.Option key={option.id} value={option.id}>
                            {option.name}
                        </ContextMenu.Option>
                    ))}
                </ContextMenu>
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
                            'category-bar-selected': selected,
                        })}
                    >
                        {name}
                    </button>
                );
            })}
        </div>
    );
};

export default CategoryBar;
