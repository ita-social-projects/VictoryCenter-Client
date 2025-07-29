import { ProgramsApi } from './programs-api';
import { mockCategories, mockPrograms } from '../../../../utils/mock-data/admin-page/program-page';
import { ProgramCategoryCreateUpdate, ProgramCreateUpdate } from '../../../../types/admin/programs';

global.URL.createObjectURL = jest.fn(() => 'mocked-image-url');

describe('ProgramsApi', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    describe('fetchProgramCategories', () => {
        it('should return all program categories', async () => {
            const promise = ProgramsApi.fetchProgramCategories();
            jest.runAllTimers();
            const result = await promise;

            expect(result).toEqual(mockCategories);
            expect(result).toHaveLength(mockCategories.length);
        });
    });

    describe('fetchProgramById', () => {
        it('should return program when found', async () => {
            const promise = ProgramsApi.fetchProgramById(1);
            jest.runAllTimers();
            const result = await promise;

            expect(result).toEqual(mockPrograms[0]);
            expect(result?.id).toBe(1);
        });

        it('should return null when program not found', async () => {
            const promise = ProgramsApi.fetchProgramById(999);
            jest.runAllTimers();
            const result = await promise;

            expect(result).toBeNull();
        });
    });

    describe('fetchPrograms', () => {
        it('should return paginated programs for category', async () => {
            const promise = ProgramsApi.fetchPrograms(1, 1, 5);
            jest.runAllTimers();
            const result = await promise;

            expect(result.items).toBeDefined();
            expect(result.totalItemsCount).toBeDefined();
            expect(result.items.every((program) => program.categories.some((cat) => cat.id === 1))).toBe(true);
        });

        it('should filter by status when provided', async () => {
            const promise = ProgramsApi.fetchPrograms(1, 1, 10, 'Published');
            jest.runAllTimers();
            const result = await promise;

            expect(result.items.every((program) => program.status === 'Published')).toBe(true);
        });

        it('should handle pagination correctly', async () => {
            const pageSize = 2;
            const promise = ProgramsApi.fetchPrograms(1, 1, pageSize);
            jest.runAllTimers();
            const result = await promise;

            expect(result.items).toHaveLength(Math.min(pageSize, result.totalItemsCount));
        });

        it('should return empty array for non-existent category', async () => {
            const promise = ProgramsApi.fetchPrograms(999, 1, 10);
            jest.runAllTimers();
            const result = await promise;

            expect(result.items).toHaveLength(0);
            expect(result.totalItemsCount).toBe(0);
        });

        it('should handle second page correctly', async () => {
            const promise = ProgramsApi.fetchPrograms(1, 2, 1);
            jest.runAllTimers();
            const result = await promise;

            expect(result).toBeDefined();
        });
    });

    describe('addProgram', () => {
        it('should add program with File image', async () => {
            const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
            const programData: ProgramCreateUpdate = {
                id: null,
                name: 'Test Program',
                description: 'Test Description',
                status: 'Draft',
                img: mockFile,
                categoryIds: [1, 2],
            };

            const promise = ProgramsApi.addProgram(programData);
            jest.runAllTimers();
            const result = await promise;

            expect(result.id).toBeDefined();
            expect(result.name).toBe(programData.name);
            expect(result.description).toBe(programData.description);
            expect(result.status).toBe(programData.status);
            expect(result.categories).toHaveLength(2);
            expect(URL.createObjectURL).toHaveBeenCalledWith(mockFile);
        });

        it('should add program with string image', async () => {
            const programData: ProgramCreateUpdate = {
                id: null,
                name: 'Test Program 2',
                description: 'Test Description 2',
                status: 'Published',
                img: 'http://example.com/image.jpg',
                categoryIds: [1],
            };

            const promise = ProgramsApi.addProgram(programData);
            jest.runAllTimers();
            const result = await promise;

            expect(result.img).toBe('http://example.com/image.jpg');
            expect(URL.createObjectURL).not.toHaveBeenCalled();
        });

        it('should add program with no image', async () => {
            const programData: ProgramCreateUpdate = {
                id: null,
                name: 'Test Program 3',
                description: 'Test Description 3',
                status: 'Draft',
                img: null,
                categoryIds: [2],
            };

            const promise = ProgramsApi.addProgram(programData);
            jest.runAllTimers();
            const result = await promise;

            expect(result.img).toBeNull();
        });

        it('should handle empty categoryIds', async () => {
            const programData: ProgramCreateUpdate = {
                id: null,
                name: 'Test Program 4',
                description: 'Test Description 4',
                status: 'Draft',
                img: null,
                categoryIds: [],
            };

            const promise = ProgramsApi.addProgram(programData);
            jest.runAllTimers();
            const result = await promise;

            expect(result.categories).toHaveLength(0);
        });
    });

    describe('editProgram', () => {
        it('should edit existing program with File image', async () => {
            const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
            const programData: ProgramCreateUpdate = {
                id: 1,
                name: 'Updated Program',
                description: 'Updated Description',
                status: 'Published',
                img: mockFile,
                categoryIds: [2],
            };

            const promise = ProgramsApi.editProgram(programData);
            jest.runAllTimers();
            const result = await promise;

            expect(result.id).toBe(1);
            expect(result.name).toBe(programData.name);
        });

        it('should edit existing program with string image', async () => {
            const programData: ProgramCreateUpdate = {
                id: 2,
                name: 'Updated Program 2',
                description: 'Updated Description 2',
                status: 'Draft',
                img: 'http://example.com/new-image.jpg',
                categoryIds: [1],
            };

            const promise = ProgramsApi.editProgram(programData);
            jest.runAllTimers();
            const result = await promise;

            expect(result.img).toBe('http://example.com/new-image.jpg');
        });

        it('should edit existing program with null image', async () => {
            const programData: ProgramCreateUpdate = {
                id: 3,
                name: 'Updated Program 3',
                description: 'Updated Description 3',
                status: 'Published',
                img: null,
                categoryIds: [1, 2],
            };

            const promise = ProgramsApi.editProgram(programData);
            jest.runAllTimers();
            const result = await promise;

            expect(result.img).toBeNull();
        });

        it('should throw error when program not found', async () => {
            const programData: ProgramCreateUpdate = {
                id: 999,
                name: 'Non-existent Program',
                description: 'Description',
                status: 'Draft',
                img: null,
                categoryIds: [1],
            };

            const promise = ProgramsApi.editProgram(programData);
            jest.runAllTimers();
            await expect(promise).rejects.toThrow('Program not found');
        });
    });

    describe('deleteProgram', () => {
        it('should delete existing program', async () => {
            const initialLength = mockPrograms.length;
            const programToDelete = mockPrograms[0];

            const promise = ProgramsApi.deleteProgram(programToDelete.id);
            jest.runAllTimers();
            await promise;

            expect(mockPrograms).toHaveLength(initialLength - 1);
            expect(mockPrograms.find((p) => p.id === programToDelete.id)).toBeUndefined();
        });

        it('should throw error when program not found', async () => {
            const promise = ProgramsApi.deleteProgram(999);
            jest.runAllTimers();
            await expect(promise).rejects.toThrow('Program not found');
        });
    });

    describe('addProgramCategory', () => {
        it('should add new category', async () => {
            const categoryData: ProgramCategoryCreateUpdate = {
                id: null,
                name: 'New Category',
            };

            const promise = ProgramsApi.addProgramCategory(categoryData);
            jest.runAllTimers();
            const result = await promise;

            expect(result.id).toBeDefined();
            expect(result.name).toBe(categoryData.name);
            expect(result.programsCount).toBe(0);
            expect(mockCategories).toContain(result);
        });
    });

    describe('editCategory', () => {
        it('should edit existing category', async () => {
            const categoryData: ProgramCategoryCreateUpdate = {
                id: 1,
                name: 'Updated Category Name',
            };

            const promise = ProgramsApi.editCategory(categoryData);
            jest.runAllTimers();
            const result = await promise;

            expect(result.id).toBe(1);
            expect(result.name).toBe(categoryData.name);
            expect(mockCategories.find((c) => c.id === 1)?.name).toBe(categoryData.name);
        });

        it('should throw error when category not found', async () => {
            const categoryData = {
                id: 999,
                name: 'Non-existent Category',
            };

            const promise = ProgramsApi.editCategory(categoryData);
            jest.runAllTimers();
            await expect(promise).rejects.toThrow('Category not found');
        });
    });

    describe('deleteCategory', () => {
        it('should delete category with zero programs', async () => {
            const categoryToDelete = mockCategories.find((c) => c.programsCount === 0)!;
            const initialLength = mockCategories.length;

            const promise = ProgramsApi.deleteCategory(categoryToDelete.id);
            jest.runAllTimers();
            await promise;

            expect(mockCategories).toHaveLength(initialLength - 1);
            expect(mockCategories.find((c) => c.id === categoryToDelete.id)).toBeUndefined();
        });

        it('should throw error when category has programs', async () => {
            const categoryWithPrograms = mockCategories.find((c) => c.programsCount > 0)!;

            const promise = ProgramsApi.deleteCategory(categoryWithPrograms.id);
            jest.runAllTimers();
            await expect(promise).rejects.toThrow('Category has at least one program');
        });

        it('should throw error when category not found', async () => {
            const promise = ProgramsApi.deleteCategory(999);
            jest.runAllTimers();
            await expect(promise).rejects.toThrow('Category not found');
        });
    });
});
