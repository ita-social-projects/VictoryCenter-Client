import { useCallback } from 'react';
import { Program, ProgramCategory } from '@/types/admin/programs';

export const useCategoriesCounter = () => {
    const incrementCategoriesCount = useCallback(
        (categories: ProgramCategory[], program: Program): ProgramCategory[] => {
            const programCategoryIds = new Set(program.categories.map((c) => c.id));
            return categories.map((cat) =>
                programCategoryIds.has(cat.id) ? { ...cat, programsCount: cat.programsCount + 1 } : cat,
            );
        },
        [],
    );

    const decrementCategoriesCount = useCallback(
        (categories: ProgramCategory[], program: Program): ProgramCategory[] => {
            const programCategoryIds = new Set(program.categories.map((c) => c.id));
            return categories.map((cat) =>
                programCategoryIds.has(cat.id) ? { ...cat, programsCount: Math.max(0, cat.programsCount - 1) } : cat,
            );
        },
        [],
    );

    const updateCategoriesCount = useCallback(
        (categories: ProgramCategory[], originalProgram: Program, updatedProgram: Program): ProgramCategory[] => {
            const originalCategoryIds = new Set(originalProgram.categories.map((c) => c.id));
            const updatedCategoryIds = new Set(updatedProgram.categories.map((c) => c.id));

            return categories.map((category) => {
                const wasInCategory = originalCategoryIds.has(category.id);
                const isInCategory = updatedCategoryIds.has(category.id);

                if (!wasInCategory && isInCategory) {
                    return { ...category, programsCount: category.programsCount + 1 };
                }
                if (wasInCategory && !isInCategory) {
                    return { ...category, programsCount: Math.max(0, category.programsCount - 1) };
                }

                return category;
            });
        },
        [],
    );

    return {
        incrementCategoriesCount,
        decrementCategoriesCount,
        updateCategoriesCount,
    };
};
