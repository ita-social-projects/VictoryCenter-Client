import { memo } from 'react';
import classNames from 'classnames';
import styles from './CategoryButton.module.scss';

export interface CategoryButtonProps<T> {
    category: T;
    selectedCategory: T | null;
    getCategoryKey: (item: T) => string | number;
    getCategoryDisplayName: (item: T) => string;
    onSelect: (category: T) => void;
}

function CategoryButtonInner<T>({
    category,
    selectedCategory,
    getCategoryKey,
    getCategoryDisplayName,
    onSelect,
}: Readonly<CategoryButtonProps<T>>) {
    const key = getCategoryKey(category);
    const name = getCategoryDisplayName(category);
    const isSelected = !!selectedCategory && key === getCategoryKey(selectedCategory);

    return (
        <button
            onClick={() => onSelect(category)}
            className={classNames(styles['category-bar-button'], {
                [styles['category-bar-button-selected']]: isSelected,
            })}
        >
            {name}
        </button>
    );
}

export const CategoryButton = memo(CategoryButtonInner) as typeof CategoryButtonInner;
