import { VisibilityStatus, PaginationResult } from '../../../../types/admin/common';
import { RequestOptions } from '../../../../types/common/api';
import {
    ProgramCategory,
    ProgramCreateUpdate,
    ProgramCategoryCreateUpdate,
    ProgramSearchItemData,
    Program,
} from '../../../../types/admin/programs';
import { mockPrograms, mockCategories } from '../../../../utils/mock-data/admin/programs';

// !!!
// Delete after actual integration with backend

// ============================================
let mockProgramId = Math.max(...mockPrograms.map((p) => p.id), 0) + 1;
let mockCategoryId = Math.max(...mockCategories.map((c) => c.id), 0) + 1;
export let mockDelay = 400;
export let throwErrorsInApi = false;

// Helper function to convert Program to ProgramSuggestion
const convertProgramToSuggestion = (program: Program): ProgramSearchItemData => {
    return {
        id: program.id,
        name: program.name,
        categories: program.categories.map((cat) => cat.name),
    };
};

// Simulates an async delay with AbortSignal support — used for testing fetch cancellation behavior
const simulateAsyncOperation = (delay: number, signal?: AbortSignal): Promise<void> => {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            cleanup();
            resolve();
        }, delay);

        const cleanup = () => {
            clearTimeout(timeoutId);
            signal?.removeEventListener('abort', onAbort);
        };

        const onAbort = () => {
            cleanup();
            const error = new Error('Request was cancelled');
            error.name = 'AbortError';
            reject(error);
        };

        if (signal?.aborted) {
            onAbort();
        } else {
            signal?.addEventListener('abort', onAbort, { once: true });
        }
    });
};
// ============================================
// !!!
// !!!

export const ProgramsApi = {
    fetchPrograms: async (
        categoryId: number,
        offset: number,
        limit: number,
        status?: VisibilityStatus,
        options?: RequestOptions,
    ): Promise<PaginationResult<Program>> => {
        await simulateAsyncOperation(mockDelay, options?.cancellationSignal);
        if (throwErrorsInApi) throw new Error('Error fetching programs');

        const filtered = mockPrograms.filter((program) => {
            const inCategory = program.categories.some((category: ProgramCategory) => category.id === categoryId);
            const statusMatches = status === undefined || program.status === status;
            return inCategory && statusMatches;
        });

        const start = offset;
        const end = offset + limit;

        return {
            items: filtered.slice(start, end),
            totalItemsCount: filtered.length,
        };
    },

    fetchProgramSearchItems: async (
        searchTerm: string,
        offset: number,
        limit: number,
        options?: RequestOptions,
    ): Promise<PaginationResult<ProgramSearchItemData>> => {
        await simulateAsyncOperation(mockDelay, options?.cancellationSignal);
        if (throwErrorsInApi) throw new Error('Error fetching program suggestions');

        const filtered = mockPrograms.filter((program) => {
            const nameMatches = program.name.toLowerCase().includes(searchTerm.toLowerCase());
            const categoryMatches = program.categories.some((cat) =>
                cat.name.toLowerCase().includes(searchTerm.toLowerCase()),
            );
            return nameMatches || categoryMatches;
        });

        const sorted = filtered.sort((a, b) => {
            const aNameMatch = a.name.toLowerCase().includes(searchTerm.toLowerCase());
            const bNameMatch = b.name.toLowerCase().includes(searchTerm.toLowerCase());

            if (aNameMatch && !bNameMatch) return -1;
            if (!aNameMatch && bNameMatch) return 1;

            return a.name.localeCompare(b.name);
        });

        const start = offset;
        const end = offset + limit;
        const paginatedItems = sorted.slice(start, end);

        const suggestions = paginatedItems.map(convertProgramToSuggestion);

        return {
            items: suggestions,
            totalItemsCount: filtered.length,
        };
    },

    fetchProgramById: async (id: number, options?: RequestOptions): Promise<Program | null> => {
        await simulateAsyncOperation(mockDelay, options?.cancellationSignal);
        if (throwErrorsInApi) throw new Error('Error fetching program');
        return mockPrograms.find((program) => program.id === id) ?? null;
    },

    addProgram: async (program: ProgramCreateUpdate): Promise<Program> => {
        await new Promise((resolve) => setTimeout(resolve, mockDelay));

        if (throwErrorsInApi) throw new Error('Error imitation');

        const newProgram: Program = {
            id: ++mockProgramId,
            name: program.name,
            description: program.description,
            status: program.status,
            img: program.img,
            categories: mockCategories.filter((c) => program.categoryIds.includes(c.id)),
        };

        mockPrograms.push(newProgram);
        return newProgram;
    },

    editProgram: async (program: ProgramCreateUpdate): Promise<Program> => {
        await new Promise((resolve) => setTimeout(resolve, mockDelay));

        if (throwErrorsInApi) throw new Error('Error imitation');

        const index = mockPrograms.findIndex((p) => p.id === program.id);
        if (index === -1) throw new Error('Program not found');

        const updatedProgram: Program = {
            id: program.id!,
            name: program.name,
            description: program.description,
            status: program.status,
            img: program.img,
            categories: mockCategories.filter((c) => program.categoryIds.includes(c.id)),
        };

        mockPrograms[index] = updatedProgram;
        return updatedProgram;
    },

    deleteProgram: async (id: number): Promise<void> => {
        await new Promise((resolve) => setTimeout(resolve, mockDelay));

        if (throwErrorsInApi) throw new Error('Error imitation');

        const index = mockPrograms.findIndex((p) => p.id === id);
        if (index === -1) throw new Error('Program not found');
        mockPrograms.splice(index, 1);
    },

    fetchProgramCategories: async (options?: RequestOptions): Promise<ProgramCategory[]> => {
        await simulateAsyncOperation(mockDelay, options?.cancellationSignal);
        if (throwErrorsInApi) throw new Error('Error fetching program categories');
        return [...mockCategories];
    },

    addProgramCategory: async (category: ProgramCategoryCreateUpdate): Promise<ProgramCategory> => {
        await new Promise((resolve) => setTimeout(resolve, mockDelay));

        if (throwErrorsInApi) throw new Error('Error imitation');

        const newCategory: ProgramCategory = {
            id: ++mockCategoryId,
            name: category.name,
            programsCount: 0,
        };

        mockCategories.push(newCategory);
        return newCategory;
    },

    editProgramCategory: async (category: ProgramCategoryCreateUpdate): Promise<ProgramCategory> => {
        await new Promise((resolve) => setTimeout(resolve, mockDelay));

        if (throwErrorsInApi) throw new Error('Error imitation');

        const index = mockCategories.findIndex((c) => c.id === category.id);
        if (index === -1) throw new Error('Category not found');

        const updated = {
            ...mockCategories[index],
            name: category.name,
        };

        mockCategories[index] = updated;

        return updated;
    },

    deleteProgramCategory: async (id: number): Promise<void> => {
        await new Promise((resolve) => setTimeout(resolve, mockDelay));

        if (throwErrorsInApi) throw new Error('Error imitation');

        const index = mockCategories.findIndex((c) => c.id === id);
        if (index === -1) throw new Error('Category not found');

        const category = mockCategories[index];

        if (category.programsCount > 0) {
            throw new Error('Category has at least one program');
        }

        mockCategories.splice(index, 1);
    },
};
