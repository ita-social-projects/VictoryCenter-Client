import { memo } from 'react';
import classNames from 'classnames';
import './CategoryButton.scss';

export interface CategoryButtonProps {
    category: any;
    isSelected: boolean;
    name: string;
    onSelect: (category: any) => void;
}

export const CategoryButton = memo(({ category, isSelected, name, onSelect }: CategoryButtonProps) => {
    return (
        <button
            onClick={() => onSelect(category)}
            className={classNames('category-bar-button', {
                'category-bar-button-selected': isSelected,
            })}
        >
            {name}
        </button>
    );
});
