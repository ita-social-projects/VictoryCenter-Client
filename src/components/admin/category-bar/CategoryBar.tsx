import { useCallback, useEffect, useRef, useState } from 'react';
import { ContextMenuButton } from '../context-menu-button/ContextMenuButton';
import { CategoryButton } from '../category-button/CategoryButton';
import { ReactComponent as ArrowLeftIcon } from '../../../assets/icons/arrow-left.svg';
import { ReactComponent as ArrowRightIcon } from '../../../assets/icons/arrow-right.svg';
import styles from './CategoryBar.module.scss';

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
    scrollAmount?: number;
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
    scrollAmount = 400,
}: CategoryBarProps<T>) => {
    const categoriesContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    const checkScroll = useCallback(() => {
        const container = categoriesContainerRef.current;
        if (!container) return;

        const { scrollLeft, scrollWidth, clientWidth } = container;
        const isAtStart = scrollLeft <= 1;
        const isAtEnd = scrollLeft >= scrollWidth - clientWidth - 1;

        setShowLeftArrow(!isAtStart);
        setShowRightArrow(!isAtEnd);
    }, []);

    useEffect(() => {
        checkScroll();
        const container = categoriesContainerRef.current;
        if (!container) return;

        if (typeof ResizeObserver !== 'undefined') {
            const resizeObserver = new ResizeObserver(checkScroll);
            resizeObserver.observe(container);

            return () => resizeObserver.disconnect();
        }

        return undefined;
    }, [categories, checkScroll]);

    const handleScroll = useCallback(
        (direction: 'left' | 'right') => {
            const container = categoriesContainerRef.current;
            if (!container) return;

            const scrollValue = direction === 'left' ? -scrollAmount : scrollAmount;
            container.scrollBy({ left: scrollValue, behavior: 'smooth' });
        },
        [scrollAmount],
    );

    const handleContextMenuOptionSelected = (id: string) => {
        onContextMenuOptionSelected?.(id);
    };

    return (
        <div className={styles['category-bar']}>
            {displayContextMenuButton && contextMenuOptions.length > 0 && (
                <ContextMenuButton onOptionSelected={handleContextMenuOptionSelected}>
                    {contextMenuOptions.map((option) => (
                        <ContextMenuButton.Option key={option.id} value={option.id}>
                            {option.name}
                        </ContextMenuButton.Option>
                    ))}
                </ContextMenuButton>
            )}
            {showLeftArrow && (
                <button
                    className={styles['category-bar-arrow-left']}
                    onClick={() => handleScroll('left')}
                    type="button"
                >
                    <ArrowLeftIcon />
                </button>
            )}
            <div ref={categoriesContainerRef} className={styles['category-bar-categories']} onScroll={checkScroll}>
                {categories.map((category) => (
                    <CategoryButton
                        key={getCategoryKey(category)}
                        category={category}
                        selectedCategory={selectedCategory}
                        getCategoryKey={getCategoryKey}
                        getCategoryDisplayName={getCategoryDisplayName}
                        onSelect={onCategorySelect}
                    />
                ))}
            </div>
            {showRightArrow && (
                <button
                    className={styles['category-bar-arrow-right']}
                    onClick={() => handleScroll('right')}
                    type="button"
                >
                    <ArrowRightIcon />
                </button>
            )}
        </div>
    );
};
