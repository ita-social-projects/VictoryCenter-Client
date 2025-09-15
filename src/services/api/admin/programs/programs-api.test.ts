import { VisibilityStatus } from '../../../../types/admin/common';
import { ProgramCategoryCreateUpdate, ProgramCreateUpdate } from '../../../../types/admin/programs';
import { mockCategories, mockPrograms } from '../../../../utils/mock-data/admin/programs';
import { ProgramsApi } from './programs-api';
const programsApiModule = require('./programs-api');

describe('ProgramsApi', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        jest.clearAllMocks();
        programsApiModule.throwErrorsInApi = false;
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
            const promise = ProgramsApi.fetchPrograms(1, { offset: 1, limit: 5 });
            jest.runAllTimers();
            const result = await promise;

            expect(result.items).toBeDefined();
            expect(result.totalItemsCount).toBeDefined();
            expect(result.items.every((program) => program.categories.some((cat) => cat.id === 1))).toBe(true);
        });

        it('should filter by status when provided', async () => {
            const promise = ProgramsApi.fetchPrograms(1, { offset: 1, limit: 10 }, VisibilityStatus.Published);
            jest.runAllTimers();
            const result = await promise;

            expect(result.items.every((program) => program.status === VisibilityStatus.Published)).toBe(true);
        });

        it('should handle pagination correctly', async () => {
            const pageSize = 2;
            const promise = ProgramsApi.fetchPrograms(1, { offset: 1, limit: pageSize });
            jest.runAllTimers();
            const result = await promise;

            expect(result.items).toHaveLength(Math.min(pageSize, result.totalItemsCount));
        });

        it('should return empty array for non-existent category', async () => {
            const promise = ProgramsApi.fetchPrograms(999, { offset: 1, limit: 10 });
            jest.runAllTimers();
            const result = await promise;

            expect(result.items).toHaveLength(0);
            expect(result.totalItemsCount).toBe(0);
        });

        it('should handle second page correctly', async () => {
            const promise = ProgramsApi.fetchPrograms(1, { offset: 2, limit: 1 });
            jest.runAllTimers();
            const result = await promise;

            expect(result).toBeDefined();
        });
    });

    describe('addProgram', () => {
        it('should add program with File image', async () => {
            const programData: ProgramCreateUpdate = {
                id: null,
                name: 'Test Program',
                description: 'Test Description',
                status: VisibilityStatus.Draft,
                img: null,
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
        });

        it('should add program with no image', async () => {
            const programData: ProgramCreateUpdate = {
                id: null,
                name: 'Test Program 3',
                description: 'Test Description 3',
                status: VisibilityStatus.Draft,
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
                status: VisibilityStatus.Draft,
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
            const programData: ProgramCreateUpdate = {
                id: 1,
                name: 'Updated Program',
                description: 'Updated Description',
                status: VisibilityStatus.Published,
                img: null,
                categoryIds: [2],
            };

            const promise = ProgramsApi.editProgram(programData);
            jest.runAllTimers();
            const result = await promise;

            expect(result.id).toBe(1);
            expect(result.name).toBe(programData.name);
        });

        it('should edit existing program with null image', async () => {
            const programData: ProgramCreateUpdate = {
                id: 3,
                name: 'Updated Program 3',
                description: 'Updated Description 3',
                status: VisibilityStatus.Published,
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
                status: VisibilityStatus.Draft,
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

            const promise = ProgramsApi.editProgramCategory(categoryData);
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

            const promise = ProgramsApi.editProgramCategory(categoryData);
            jest.runAllTimers();
            await expect(promise).rejects.toThrow('Category not found');
        });
    });

    describe('deleteCategory', () => {
        it('should delete category with zero programs', async () => {
            const categoryToDelete = mockCategories.find((c) => c.programsCount === 0)!;
            const initialLength = mockCategories.length;

            const promise = ProgramsApi.deleteProgramCategory(categoryToDelete.id);
            jest.runAllTimers();
            await promise;

            expect(mockCategories).toHaveLength(initialLength - 1);
            expect(mockCategories.find((c) => c.id === categoryToDelete.id)).toBeUndefined();
        });

        it('should throw error when category has programs', async () => {
            const categoryWithPrograms = mockCategories.find((c) => c.programsCount > 0)!;

            const promise = ProgramsApi.deleteProgramCategory(categoryWithPrograms.id);
            jest.runAllTimers();
            await expect(promise).rejects.toThrow('Category has at least one program');
        });

        it('should throw error when category not found', async () => {
            const promise = ProgramsApi.deleteProgramCategory(999);
            jest.runAllTimers();
            await expect(promise).rejects.toThrow('Category not found');
        });
    });
    describe('fetchProgramSearchItems', () => {
        it('should prioritize direct name matches in sorting, then sort alphabetically', async () => {
            const programWithNameMatch = {
                id: 100,
                name: 'Core Pilates Workout',
                description: 'test',
                status: VisibilityStatus.Published,
                img: null,
                categories: [{ id: 9, name: 'General', programsCount: 1 }],
            };
            const programWithCategoryMatch = {
                id: 101,
                name: 'Advanced Flexibility',
                description: 'test',
                status: VisibilityStatus.Published,
                img: null,
                categories: [{ id: 10, name: 'Pilates', programsCount: 1 }],
            };

            mockPrograms.push(programWithNameMatch, programWithCategoryMatch);

            const searchTerm = 'Pilates';
            const promise = ProgramsApi.fetchProgramSearchItems(searchTerm, { offset: 0, limit: 10 });
            jest.runAllTimers();
            const result = await promise;

            const ids = result.items.map((i) => i.id);
            const nameMatchIndex = ids.indexOf(programWithNameMatch.id);
            const categoryMatchIndex = ids.indexOf(programWithCategoryMatch.id);

            expect(nameMatchIndex).toBeGreaterThan(-1);
            expect(categoryMatchIndex).toBeGreaterThan(-1);
            expect(nameMatchIndex).toBeLessThan(categoryMatchIndex);

            mockPrograms.pop();
            mockPrograms.pop();
        });

        it('should handle pagination correctly', async () => {
            const searchTerm = 'program';
            const limit = 2;
            const offset = 2;

            const promise = ProgramsApi.fetchProgramSearchItems(searchTerm, { offset, limit });
            jest.runAllTimers();
            const result = await promise;

            const fullResults = mockPrograms.filter(
                (p) =>
                    p.name.toLowerCase().includes(searchTerm) ||
                    p.categories.some((c) => c.name.toLowerCase().includes(searchTerm)),
            );

            expect(result.items).toHaveLength(Math.min(limit, fullResults.length - offset));
            expect(result.totalItemsCount).toBe(fullResults.length);
        });

        it('should return an empty result when no matches are found', async () => {
            const searchTerm = 'NonExistentProgramXYZ';
            const promise = ProgramsApi.fetchProgramSearchItems(searchTerm, { offset: 0, limit: 10 });
            jest.runAllTimers();
            const result = await promise;

            expect(result.items).toHaveLength(0);
            expect(result.totalItemsCount).toBe(0);
        });
    });

    describe('API Error and Cancellation Handling', () => {
        it('should reject fetchPrograms with AbortError if the request is cancelled', async () => {
            const controller = new AbortController();
            const promise = ProgramsApi.fetchPrograms(
                1,
                { offset: 0, limit: 10, requestOptions: { cancellationSignal: controller.signal } },
            );

            controller.abort();
            jest.runAllTimers();

            await expect(promise).rejects.toThrow('Request was cancelled');
            await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
        });

        it('should reject fetchProgramSearchItems with AbortError if the request is cancelled', async () => {
            const controller = new AbortController();
            const promise = ProgramsApi.fetchProgramSearchItems(
                'search',
                { offset: 0, limit: 10, requestOptions: { cancellationSignal: controller.signal } },
            );

            controller.abort();
            jest.runAllTimers();

            await expect(promise).rejects.toThrow('Request was cancelled');
            await expect(promise).rejects.toMatchObject({ name: 'AbortError' });
        });

        it('should handle a pre-aborted signal correctly', async () => {
            const controller = new AbortController();
            controller.abort();

            const promise = ProgramsApi.fetchProgramById(1, { cancellationSignal: controller.signal });

            // No need to run timers, as it should reject almost instantly
            await expect(promise).rejects.toThrow('Request was cancelled');
        });
    });
});
