// import { renderHook } from '@testing-library/react';
// import { useCategoriesCounter } from './useCategoriesCounter';
// import { Program, ProgramCategory } from '../../../types/admin/programs';
// import { VisibilityStatus } from '../../../types/admin/common';

// // Test helpers
// const createCategory = (props: Partial<ProgramCategory> = {}): ProgramCategory => ({
//     id: 1,
//     name: 'Test Category',
//     programsCount: 0,
//     ...props,
// });

// const createProgram = (props: Partial<Program> = {}): Program => ({
//     id: 1,
//     name: 'Test Program',
//     description: 'Test description',
//     status: VisibilityStatus.Draft,
//     categories: [],
//     image: null,
//     ...props,
// });

// const createCategoriesArray = (count: number): ProgramCategory[] => {
//     return Array.from({ length: count }, (_, index) =>
//         createCategory({ id: index + 1, name: `Category ${index + 1}`, programsCount: 0 }),
//     );
// };

// describe('useCategoriesCounter', () => {
//     it('should return all three functions', () => {
//         const { result } = renderHook(() => useCategoriesCounter());

//         expect(result.current.incrementCategoriesCount).toBeInstanceOf(Function);
//         expect(result.current.decrementCategoriesCount).toBeInstanceOf(Function);
//         expect(result.current.updateCategoriesCount).toBeInstanceOf(Function);
//     });

//     describe('incrementCategoriesCount', () => {
//         it('should increment count for categories that program belongs to', () => {
//             const { result } = renderHook(() => useCategoriesCounter());
//             const categories: ProgramCategory[] = [
//                 createCategory({ id: 1, programsCount: 5 }),
//                 createCategory({ id: 2, programsCount: 3 }),
//                 createCategory({ id: 3, programsCount: 1 }),
//             ];
//             const program = createProgram({
//                 categories: [createCategory({ id: 1 }), createCategory({ id: 3 })],
//             });

//             const updatedCategories = result.current.incrementCategoriesCount(categories, program);

//             expect(updatedCategories).toEqual([
//                 expect.objectContaining({ id: 1, programsCount: 6 }),
//                 expect.objectContaining({ id: 2, programsCount: 3 }),
//                 expect.objectContaining({ id: 3, programsCount: 2 }),
//             ]);
//         });

//         it('should not modify categories when program has no categories', () => {
//             const { result } = renderHook(() => useCategoriesCounter());
//             const categories = createCategoriesArray(2);
//             const program = createProgram({ categories: [] });

//             const updatedCategories = result.current.incrementCategoriesCount(categories, program);

//             expect(updatedCategories).toEqual(categories);
//         });
//     });

//     describe('decrementCategoriesCount', () => {
//         it('should decrement count for categories that program belongs to', () => {
//             const { result } = renderHook(() => useCategoriesCounter());
//             const categories: ProgramCategory[] = [
//                 createCategory({ id: 1, programsCount: 5 }),
//                 createCategory({ id: 2, programsCount: 3 }),
//                 createCategory({ id: 3, programsCount: 1 }),
//             ];
//             const program = createProgram({
//                 categories: [createCategory({ id: 1 }), createCategory({ id: 3 })],
//             });

//             const updatedCategories = result.current.decrementCategoriesCount(categories, program);

//             expect(updatedCategories).toEqual([
//                 expect.objectContaining({ id: 1, programsCount: 4 }),
//                 expect.objectContaining({ id: 2, programsCount: 3 }),
//                 expect.objectContaining({ id: 3, programsCount: 0 }),
//             ]);
//         });

//         it('should not go below zero when decrementing', () => {
//             const { result } = renderHook(() => useCategoriesCounter());
//             const categories: ProgramCategory[] = [createCategory({ id: 1, programsCount: 0 })];
//             const program = createProgram({
//                 categories: [createCategory({ id: 1 })],
//             });

//             const updatedCategories = result.current.decrementCategoriesCount(categories, program);

//             expect(updatedCategories[0]?.programsCount).toBe(0);
//         });
//     });

//     describe('updateCategoriesCount', () => {
//         it('should increment count when program is added to new categories', () => {
//             const { result } = renderHook(() => useCategoriesCounter());
//             const categories: ProgramCategory[] = [
//                 createCategory({ id: 1, programsCount: 5 }),
//                 createCategory({ id: 2, programsCount: 3 }),
//             ];
//             const originalProgram = createProgram({ categories: [] });
//             const updatedProgram = createProgram({
//                 categories: [createCategory({ id: 1 }), createCategory({ id: 2 })],
//             });

//             const result_categories = result.current.updateCategoriesCount(categories, originalProgram, updatedProgram);

//             expect(result_categories).toEqual([
//                 expect.objectContaining({ id: 1, programsCount: 6 }),
//                 expect.objectContaining({ id: 2, programsCount: 4 }),
//             ]);
//         });

//         it('should decrement count when program is removed from categories', () => {
//             const { result } = renderHook(() => useCategoriesCounter());
//             const categories: ProgramCategory[] = [
//                 createCategory({ id: 1, programsCount: 5 }),
//                 createCategory({ id: 2, programsCount: 3 }),
//             ];
//             const originalProgram = createProgram({
//                 categories: [createCategory({ id: 1 }), createCategory({ id: 2 })],
//             });
//             const updatedProgram = createProgram({ categories: [] });

//             const result_categories = result.current.updateCategoriesCount(categories, originalProgram, updatedProgram);

//             expect(result_categories).toEqual([
//                 expect.objectContaining({ id: 1, programsCount: 4 }),
//                 expect.objectContaining({ id: 2, programsCount: 2 }),
//             ]);
//         });

//         it('should handle mixed changes when program categories are updated', () => {
//             const { result } = renderHook(() => useCategoriesCounter());
//             const categories: ProgramCategory[] = [
//                 createCategory({ id: 1, programsCount: 5 }),
//                 createCategory({ id: 2, programsCount: 3 }),
//                 createCategory({ id: 3, programsCount: 1 }),
//             ];
//             const originalProgram = createProgram({
//                 categories: [createCategory({ id: 1 }), createCategory({ id: 2 })],
//             });
//             const updatedProgram = createProgram({
//                 categories: [createCategory({ id: 2 }), createCategory({ id: 3 })],
//             });

//             const result_categories = result.current.updateCategoriesCount(categories, originalProgram, updatedProgram);

//             expect(result_categories).toEqual([
//                 expect.objectContaining({ id: 1, programsCount: 4 }), // removed
//                 expect.objectContaining({ id: 2, programsCount: 3 }), // stayed
//                 expect.objectContaining({ id: 3, programsCount: 2 }), // added
//             ]);
//         });

//         it('should not change count when categories remain the same', () => {
//             const { result } = renderHook(() => useCategoriesCounter());
//             const categories = createCategoriesArray(2);
//             const programCategories = [createCategory({ id: 1 })];
//             const originalProgram = createProgram({ categories: programCategories });
//             const updatedProgram = createProgram({ categories: programCategories });

//             const result_categories = result.current.updateCategoriesCount(categories, originalProgram, updatedProgram);

//             expect(result_categories).toEqual(categories);
//         });

//         it('should not go below zero when decrementing during update', () => {
//             const { result } = renderHook(() => useCategoriesCounter());
//             const categories: ProgramCategory[] = [createCategory({ id: 1, programsCount: 0 })];
//             const originalProgram = createProgram({
//                 categories: [createCategory({ id: 1 })],
//             });
//             const updatedProgram = createProgram({ categories: [] });

//             const result_categories = result.current.updateCategoriesCount(categories, originalProgram, updatedProgram);

//             expect(result_categories[0]?.programsCount).toBe(0);
//         });
//     });
// });
