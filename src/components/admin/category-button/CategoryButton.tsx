import { memo, ReactNode } from 'react';
import classNames from 'classnames';
import './CategoryButton.scss';

export interface CategoryButtonProps<T> {
    category: T;
    selectedCategory: T | null;
    getCategoryKey: (item: T) => string | number;
    getCategoryDisplayName: (item: T) => string;
    onSelect: (category: T) => void;
    renderExtra?: (category: T) => ReactNode;
}

function CategoryButtonInner<T>({
    category,
    selectedCategory,
    getCategoryKey,
    getCategoryDisplayName,
    onSelect,
    renderExtra,
}: Readonly<CategoryButtonProps<T>>) {
    const key = getCategoryKey(category);
    const name = getCategoryDisplayName(category);
    const isSelected = !!selectedCategory && key === getCategoryKey(selectedCategory);

    return (
        <div className="category-bar-button-container">
            {renderExtra && <div className="category-extra">{renderExtra(category)}</div>}
            <button
                type="button"
                onClick={() => onSelect(category)}
                className={classNames('category-bar-button', {
                    'category-bar-button-selected': isSelected,
                })}
            >
                {name}
            </button>
        </div>
    );
}

export const CategoryButton = memo(CategoryButtonInner) as typeof CategoryButtonInner;
